with open('src/App.tsx', 'r') as f:
    content = f.read()

old_code = """          } catch (e: any) {
            console.error("Local API Error", e);
            return { ok: false, text: "", error: "Local API connection failed. Check Termux/Ollama server: " + e.message };
          }"""

new_code = """          } catch (e: any) {
            console.warn("Local API connection failed. Is Ollama running on localhost?");
            return { ok: false, text: "", error: "Local API connection failed. Ensure Ollama/Termux is running: " + e.message };
          }"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Replaced Local API Error")
else:
    print("Could not find old_code")
