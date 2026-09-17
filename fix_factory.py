import re

with open('src/engines/advancedFactory.ts', 'r') as f:
    content = f.read()

# 1. Fix events.push -> this.events = [...this.events, { ... }]
def repl_events(m):
    return "this.events = [...this.events, {" + m.group(1) + "}];"
content = re.sub(r'this\.events\.push\(\{(.*?)\}\);', repl_events, content, flags=re.DOTALL)

# 2. Fix garments.push -> this.garments = [...this.garments, { ... }]
def repl_garments(m):
    return "this.garments = [...this.garments, {" + m.group(1) + "}];"
content = re.sub(r'this\.garments\.push\(\{(.*?)\}\);', repl_garments, content, flags=re.DOTALL)

# 3. Fix orders.push -> this.orders = [...this.orders, { ... }]
def repl_orders(m):
    return "this.orders = [...this.orders, {" + m.group(1) + "}];"
content = re.sub(r'this\.orders\.push\(\{(.*?)\}\);', repl_orders, content, flags=re.DOTALL)

# Write back
with open('src/engines/advancedFactory.ts', 'w') as f:
    f.write(content)

print("Factory patched")
