<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Google Clone</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .logo {
      margin-bottom: 20px;
    }

    .logo img {
      width: 272px;
      height: 92px;
    }

    .search-container {
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .search-box {
      width: 100%;
      display: flex;
      border: 1px solid #dfe1e5;
      border-radius: 24px;
      padding: 10px 20px;
      box-shadow: 0 1px 6px rgba(32,33,36,0.28);
    }

    .search-box input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 16px;
    }

    .buttons {
      margin-top: 20px;
    }

    .buttons input {
      margin: 5px;
      padding: 10px 20px;
      font-size: 14px;
      border: 1px solid #f8f9fa;
      border-radius: 4px;
      background-color: #f8f9fa;
      cursor: pointer;
    }

    .buttons input:hover {
      background-color: #f1f3f4;
    }

    footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      text-align: center;
      padding: 15px;
      background-color: #f2f2f2;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="logo">
    <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" alt="Google Logo">
  </div>
  <div class="search-container">
    <div class="search-box">
      <input type="text" placeholder="Search Google or type a URL">
    </div>
    <div class="buttons">
      <input type="button" value="Google Search">
      <input type="button" value="I'm Feeling Lucky">
    </div>
  </div>
  <footer>Google Clone by YourName · Hosted on GitHub Pages</footer>
</body>
</html>
