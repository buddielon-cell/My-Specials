import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

dup = """      }
      return p;
    }));
  };
      }
      return p;
    }));
  };"""
single = """      }
      return p;
    }));
  };"""
content = content.replace(dup, single)
with open('src/App.tsx', 'w') as f:
    f.write(content)
