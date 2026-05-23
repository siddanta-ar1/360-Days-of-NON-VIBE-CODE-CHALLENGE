import tiktoken

print("INitializing NOTEAacher Short-Term Memory Buffer..")

class SlidingWindowBuffer:
    def __init__(self, max_tokens=100):
        self.max_tokens = max_tokens

        self.messages = [
            {"role": "system", "content": "You are NOTEacher, a precise AI agent."}
        ]

        try:
            self.encoder = tiktoken.get_encoding("cl100k_base")
        except ImportError:
            print("Please run: pip install tiktoken")
            exit()

        def _count_tokens(self, text):
            return len(self.encoder.encode(text))
        
        def get_total_tokens(self):
            total = 0
            for msg in self.messages:
                total += self._count_tokens(msg["content"])
            return total
        
        def add_message(self, role, content):
            print(f"\n Adding {role.upper()} message...")
            self.mesages.append({"role": role, "content": content})

            while self.get_total_tokens() > self.max_tokens:
                if len(self.messages) > 1:
                    evicted_msg = self.mesages.pop(1)
                    print(f"Memory Full! Evicted oldest message: '{evicted_msg['content'][:20]}...'")
                else:
                    print("FATAL: A single message exceeds the entire context window!")
                    break

            print(f" Current Memory Load: {self.get_total_tokens()}/{self.max_tokens} tokens")
            

    def show_memory(self):
        print("\n--- Current ai context window ---")
        for i, msg in enumerate(self.messages):
           print(f"[{i}] {msg['role'].upper()}: {msg['content']}")

    
    if __name__ == "__main__":
        memory = SlidingWindowBuffer(max_tokens=50)
        memory.add_message("user", "Hello, how are you?")
        memory.add_message("assistant", "I'm doing well, thank you! How can I assist you today?")
        memory.show_memory()

        memory.add_message("user", "Can you tell me a joke?")
        memory.add_message("assistant", "Sure! Why don't scientists trust atoms? Because they make up everything!")
        memory.show_memory()

        memory.add_message("user", "That's a good one! Can you tell me another joke?")
        memory.show_memory()