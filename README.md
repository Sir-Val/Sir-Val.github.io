<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sum of Two Numbers</title>
    
    <!-- Include PyScript -->
    <link rel="stylesheet" href="https://pyscript.net/latest/pyscript.css" />
    <script defer src="https://pyscript.net/latest/pyscript.js"></script>
</head>
<body>
    <h1>Sum of Two Numbers</h1>

    <!-- Input fields for numbers -->
    <label for="num1">Enter the first number:</label>
    <input type="number" id="num1" step="any"><br><br>
    
    <label for="num2">Enter the second number:</label>
    <input type="number" id="num2" step="any"><br><br>
    
    <!-- Button to trigger sum calculation -->
    <button id="calculate-btn">Calculate Sum</button>

    <!-- Placeholder for the result -->
    <p id="result"></p>

    <!-- Python code using PyScript -->
    <py-script>
        from pyscript import Element

        def calculate_sum(*args):
            # Retrieve the values from the input fields
            num1 = float(Element("num1").element.value)
            num2 = float(Element("num2").element.value)
            
            # Calculate the sum
            result = num1 + num2
            
            # Display the result
            Element("result").element.innerHTML = f"The sum of the two numbers is: {result}"

        # Bind the function to the button click event
        Element("calculate-btn").element.onclick = calculate_sum
    </py-script>
</body>
</html>
