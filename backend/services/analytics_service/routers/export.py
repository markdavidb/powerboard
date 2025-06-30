# services/analytics_service/routers/export.py
from __future__ import annotations

from datetime import datetime
from io import BytesIO, StringIO
from typing import Literal

import pandas as pd                     # ← add “pandas” to requirements.txt
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from common.database import get_db
from common.security.dependencies import get_current_user
from common.models.user import User
from common.models.project import Project
from common.models.project_member import ProjectMember

# reuse the existing summaries instead of re-implementing queries
from services.analytics_service.routers.project_summary import get_project_summary
from services.analytics_service.routers.dashboard import get_summary

router = APIRouter(prefix="/export", tags=["export"])

# --------------------------------------------------------------------------- #
# GET /api/analytics/export
# --------------------------------------------------------------------------- #
@router.get("")
def export_analytics(
    export_type: Literal["dashboard", "summary"] = Query(
        ..., description="What to export – overall dashboard or a single-project summary"
    ),
    by_project: bool = Query(
        False,
        description="When export_type=dashboard ⇒ one row per project instead of a single aggregate row"
    ),
    project_id: int | None = Query(
        None,
        description="Required when export_type=summary – which project to summarise",
        example=42,
    ),
    file_format: Literal["csv", "xlsx", "json"] = Query(
        "csv", description="Export format"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Export either the *dashboard* (all your projects) or a single-project *summary*
    as **CSV / Excel / JSON**.

    **Examples**

    *Dashboard in CSV*
    ```bash
    GET /api/analytics/export?export_type=dashboard&file_format=csv
    ```

    *Per-project rows*
    ```bash
    GET /api/analytics/export?export_type=dashboard&by_project=true&file_format=csv
    ```

    *Project #17 summary in Excel*
    ```bash
    GET /api/analytics/export?export_type=summary&project_id=17&file_format=xlsx
    ```
    """

    # ------------------------------------------------------------------ #
    # 1) Collect the data
    # ------------------------------------------------------------------ #
    if export_type == "dashboard" and by_project:
        # a) find all project IDs the user owns or is a member of
        owned_q  = db.query(Project.id).filter(Project.owner_id == current_user.id)
        member_q = db.query(ProjectMember.project_id).filter(ProjectMember.user_id == current_user.id)
        project_ids = [pid for (pid,) in owned_q.union(member_q).all()]

        # b) build one summary row per project
        rows: list[dict] = []
        for pid in project_ids:
            rows.append(
                get_project_summary(
                    project_id=pid, db=db, current_user=current_user
                )
            )
        df = pd.DataFrame(rows)
        filename_base = f"projects-{current_user.id}"

    elif export_type == "dashboard":
        # single aggregate row
        data = get_summary(db=db, current_user=current_user)
        df = pd.DataFrame([data])
        filename_base = f"dashboard-{current_user.id}"

    else:  # export_type == "summary"
        if project_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="project_id is required when export_type=summary",
            )
        data = get_project_summary(
            project_id=project_id, db=db, current_user=current_user
        )
        df = pd.DataFrame([data])
        filename_base = f"project-{project_id}-summary"

    # ------------------------------------------------------------------ #
    # 2) Serialize into the requested format
    # ------------------------------------------------------------------ #
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

    if file_format == "csv":
        buff = StringIO()
        df.to_csv(buff, index=False)
        buff.seek(0)
        media, extension, stream = "text/csv", "csv", buff

    elif file_format == "xlsx":
        buff = BytesIO()
        with pd.ExcelWriter(buff, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False, sheet_name="Export")
        buff.seek(0)
        media = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        extension, stream = "xlsx", buff

    else:  # json
        buff = BytesIO(df.to_json(orient="records").encode())
        media, extension, stream = "application/json", "json", buff

    filename = f"{filename_base}-{timestamp}.{extension}"

    # ------------------------------------------------------------------ #
    # 3) Stream it back to the client
    # ------------------------------------------------------------------ #
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(stream, media_type=media, headers=headers)
