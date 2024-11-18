const createDynamicHTML = (data) => {
  return `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IQ Test Result</title>
    <style>
        /* General Styles */


        /* A4 container */
        .a4-container {
            width: 210mm;
            height: 297mm;
            background: white;
            border: 10px solid #004080; /* Blue border */
            padding: 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            font-family: 'Courier New', Courier, monospace;
        }

        /* Logo Space */
        .logo {
            width: 350px;
            height: 150px;
            background-image: url("https://iqed.in/wp-content/uploads/2024/04/IQED-Blue.webp");
            background-size: contain;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 100px;
            font-size: 14px;
            
        }

        /* Title */
        .title {
            font-size: 40px;
            font-weight: 900;
            margin-bottom: 20px;
            color: #004080;
            letter-spacing: 15px;
        }

        /* Name Space */
        .name {
            font-size: 54px;
            margin-bottom: 40px;
            font-weight: 900;
            color: #004080;
        }

        /* Score Box */
        .score-box {
            width: 50%;
            height: 100px;
            border: 3px solid #004080;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 28px;
            color: #004080;
            margin-bottom: 40px;
        }

        /* Description */
        .description {
            margin-top: 40px;
            font-size: 16px;
            text-align: center;
            color: #004080;
            width: 90%;
        }

        /* Join Us Button */
        .join-us {
       
            margin-top: 20px;
        }

        .join-us a {
            text-decoration: none;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 18px;
        }

        .join-us a:hover {
            background-color: #0056b3;
        }
        .sorce{
            font-weight: 900;
        }
    </style>
</head>
<body>
    <div class="a4-container">
        <!-- Logo Space -->
        <div class="logo">
            
        </div>

        <!-- Title -->
        <div class="title">
            IQ TEST RESULT
        </div>

        <!-- Name Space -->
        <div class="name">
           ${data.name}
        </div>

        <!-- Score Box -->
        <div class="score-box">
            IQ Score: <span class="sorce" >${data.score}</span>
        </div>

        <!-- Description -->
        <p class="description">
            This IQED Challenge Platform offers a comprehensive cognitive assessment to evaluate key cognitive skills, such as logical reasoning, verbal comprehension, working memory, and spatial reasoning. This assessment is available for children, adolescents, and adults, each with age-appropriate questions to measure intelligence effectively.
        </p>

        <!-- Join Us Button -->
        <div class="join-us">
            <a href="https://example.com" target="_blank">Join Us</a>
        </div>
    </div>
</body>
</html>

    `;
};

module.exports = createDynamicHTML
