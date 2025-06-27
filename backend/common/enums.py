#app/core/enums.py

from enum import Enum

class TaskStatus(str, Enum):
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    REVIEW = "Review"
    DONE = "Done"

class ProjectStatus(str, Enum):
    IN_PROGRESS = "In Progress"
    DONE        = "Done"

class ProjectRole(str, Enum):
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"

class IssueType(str, Enum):
    TASK = "Task"
    BUG = "Bug"
    NEW_FEATURE = "New Feature"
    IMPROVEMENT = "Improvement"

class Priority(str, Enum):
    HIGHEST = "Highest"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    LOWEST = "Lowest"
