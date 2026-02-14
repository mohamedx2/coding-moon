
import enum

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"
    super_admin = "super_admin"

print(f"UserRole.admin type: {type(UserRole.admin)}")
print(f"Equality check: {'admin' == UserRole.admin}")
print(f"In list check: {'admin' in [UserRole.admin]}")
print(f"In tuple check: {'admin' in (UserRole.admin,)}")
