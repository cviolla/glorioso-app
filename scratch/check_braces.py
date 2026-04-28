
with open('src/app/admin/orders/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
    open_braces = content.count('{')
    close_braces = content.count('}')
    print(f"Open: {open_braces}, Close: {close_braces}")
    
    # Check if there are any characters after the last closing brace of the component
    # Actually, let's just see the last 20 characters
    print(f"Last 20 chars: {repr(content[-20:])}")
