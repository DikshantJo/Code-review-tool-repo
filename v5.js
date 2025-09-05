  function runCode() {
      const userInput = document.getElementById("userInput").value;

      // ❌ 1. Dangerous: directly injecting user input into the DOM (XSS)
      document.getElementById("output").innerHTML = "You typed: " + userInput;

      // ❌ 2. Dangerous: using eval on user input (Remote Code Execution)
      eval(userInput);

      // ❌ 3. Dangerous: constructing a URL redirect from untrusted input
      if (userInput.startsWith("http")) {
        window.location = userInput;
      }

      // ❌ 4. Dangerous: storing sensitive info in localStorage
      localStorage.setItem("apiKey", "super-secret-key");
    }
