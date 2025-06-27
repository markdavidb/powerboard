from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from common.database import get_db
from common.security.dependencies import get_current_user
from common.models.user import User
from common.models.project_member import ProjectMember
from common.models.project import Project  # Used to check if project exists
from common.schemas.project_member_schema import ProjectMemberCreate, ProjectMember as ProjectMemberSchema
from services.notification_service.events import added_to_project
from services.notification_service.events import removed_from_project  # ⬅️ import at top of file

router = APIRouter()

@router.post("/", response_model=ProjectMemberSchema)
async def add_member_to_project(
        member_in: ProjectMemberCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # 1) Verify the project exists
    project = db.query(Project).filter(Project.id == member_in.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # 2) Only the project owner can add members
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add members to this project"
        )

    # 3) Verify the user to be added exists, based on username
    member_user = db.query(User).filter(User.username == member_in.username).first()
    if not member_user:
        raise HTTPException(status_code=404, detail="User to add not found")

    # 4) Check if the user is already a member
    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == member_in.project_id,
        ProjectMember.user_id == member_user.id
    ).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this project"
        )

    # 5) Create and persist the new project member record using member_user.id
    new_member = ProjectMember(
        project_id=member_in.project_id,
        user_id=member_user.id,
        role=member_in.role  # Role from the schema; if not provided, default is used
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    added_to_project(db, project, member_user, current_user)

    return new_member

@router.get("/{project_id}/members", response_model=List[ProjectMemberSchema])
def list_project_members(
        project_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Verify that the project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check that the current user is either the owner or a member of the project
    if project.owner_id != current_user.id:
        membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view members of this project"
            )

    # Get members added via the project_members table
    members = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).all()

    # If the owner is not already in the list, add the owner with a role "owner"
    if project.owner_id not in [member.user_id for member in members]:
        owner_member = ProjectMember(
            project_id=project.id,
            user_id=project.owner_id,
            role="owner"
        )
        # Attach the owner user data so that the username property can be resolved.
        owner_member.user = project.owner
        members.insert(0, owner_member)

    return members

@router.delete("/{project_id}/members/{username}")
def remove_member(
        project_id: int,
        username: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Verify the project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Only the project owner can remove members
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to remove members from this project"
        )

    # Look up the user by username
    member_user = db.query(User).filter(User.username == username).first()
    if not member_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find the membership record using user_id from the found user
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == member_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this project"
        )

    db.delete(member)
    db.commit()
    removed_from_project(db, project, member_user)

    return {"detail": "Member removed"}

@router.put("/{project_id}/members/{username}", response_model=ProjectMemberSchema)
def update_member_role(
        project_id: int,
        username: str,
        member_in: ProjectMemberCreate,  # Alternatively, define a separate update schema
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Verify the project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Only the project owner can update member roles
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update members in this project"
        )

    # Look up the user by username
    member_user = db.query(User).filter(User.username == username).first()
    if not member_user:
        raise HTTPException(status_code=404, detail="User not found")

    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == member_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this project"
        )

    # Update only the role since project_id and user_id are the primary keys
    member.role = member_in.role
    db.commit()
    db.refresh(member)
    return member
