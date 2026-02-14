import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from main import app

print("Registered Routes:")
for route in app.routes:
    # Handle multiple types of routes
    path = getattr(route, "path", "No Path")
    methods = getattr(route, "methods", "No Methods")
    print(f"{methods} - {path}")
