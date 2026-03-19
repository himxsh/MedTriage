import json

json_path = "/Users/himeshjain/Library/Application Support/Code/User/workspaceStorage/43cad5a8ba5b3b31cac5308699e7d27b/GitHub.copilot-chat/chat-session-resources/e4b1f79b-4f91-4093-905c-fe5e418812ed/call_MHxHQllyTTFMd2xZTFBRbHNuUGc__vscode-1773481657868/content.json"
with open(json_path, "r") as f:
    dashboard_jsx = json.load(f)

# The jsx starts with '(\n    <div...' and ends with '\n  )'
# We strip the outer parens if they exist
content = dashboard_jsx.strip()
if content.startswith("("):
    content = content[1:]
if content.endswith(")"):
    content = content[:-1]

component = f"""
export default function Dashboard() {{
  return (
    <div style={{{{width: '100%', minHeight: '100vh', position: 'relative'}}}}>
      {content}
    </div>
  );
}}
"""

with open("frontend/src/Dashboard.jsx", "w") as f:
    f.write(component)

print("Dashboard.jsx updated.")
