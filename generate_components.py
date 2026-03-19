import json

json_path = "/Users/himeshjain/Library/Application Support/Code/User/workspaceStorage/43cad5a8ba5b3b31cac5308699e7d27b/GitHub.copilot-chat/chat-session-resources/e4b1f79b-4f91-4093-905c-fe5e418812ed/call_MHxVUExXN2Z0MWJQUzlKTDRDOWk__vscode-1773481657839/content.json"
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
      {{/* Wrapper for absolute positioning from Figma */}}
      {content}
    </div>
  );
}}
"""

with open("frontend/src/Dashboard.jsx", "w") as f:
    f.write(component)

app_component = """
import Dashboard from './Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-[#E2E2DC] flex justify-center w-full">
      <div className="relative shadow-xl overflow-hidden" style={{ width: 1440, height: 900 }}>
        <Dashboard />
      </div>
    </div>
  )
}

export default App
"""

with open("frontend/src/App.jsx", "w") as f:
    f.write(app_component)
