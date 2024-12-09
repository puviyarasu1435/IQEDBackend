const htmltemplte = (data) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IQ Test Result</title>
  </head>
  
  <body style="margin: 0; padding: 0; font-family: 'Courier New', Courier, monospace; background: #f4f4f4;">
  
      <div style="width: 793px; height: 100%; background: white; border: 10px solid #004080; padding: 20px; box-sizing: border-box; margin: 20px auto;justify-content: center;">
  
          <!-- Logo Space -->
          <div style="width: 100%; height: 150px; margin-bottom: 100px; text-align: center;">
              <img src="https://firebasestorage.googleapis.com/v0/b/eshikhay-database.appspot.com/o/IQED_Logo.png?alt=media&token=622289a0-3a68-44bc-bab7-7b372030ed93" alt="IQED Logo" 
                  style="max-width:350px; max-height: 100%; object-fit: contain;">
          </div>
  
          <!-- Title -->
          <div style="font-size: 40px; font-weight: bold; color: #004080; letter-spacing: 15px; text-align: center; margin-bottom: 20px;">
              IQ TEST RESULT
          </div>
  
          <!-- Name Space -->
          <div style="font-size: 54px; font-weight: bold; color: #004080; margin-bottom: 40px; text-align: center;">
              ${data.name}
          </div>
  
          <!-- Score Box -->
          <div style="border: 3px solid #004080; font-size: 28px; color: #004080; margin-bottom: 40px; text-align: center; ">
              IQ Score: <span style="font-weight: bold;"> ${data.score}</span>
          </div>
  
          <!-- Chart Image -->
          <div style="margin-bottom: 40px; text-align: center;background-color:#0b57d0;">
              <img src="cid:chartimage" alt="chartimage" style="max-width: 500px; max-height: 300px;">
          </div>
  
          <!-- Description -->
          <p style="margin: 40px auto 20px; font-size: 16px; color: #004080; text-align: center; width: 90%;">
              This IQ test result reflects your performance on a standardized test designed to measure cognitive abilities.
          </p>
  
          <!-- Join Us Button -->
          <div style="margin-top: 20px; text-align: center;">
              <a href="https://www.iqed.in/" target="_blank" 
                 style="text-decoration: none; background-color: #007bff; color: white; padding: 10px 20px; 
                 border-radius: 5px; font-size: 18px; display: inline-block;">
                  Join Us
              </a>
          </div>
      </div>
  
  </body>
  </html>
  
  `;
  };
  const htmltemplteno = (data) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IQ Test Result</title>
  </head>
  
  <body style="margin: 0; padding: 0; font-family: 'Courier New', Courier, monospace; background: #f4f4f4;">
  
      <div style="width: 793px; height: 100%; background: white; border: 10px solid #004080; padding: 20px; box-sizing: border-box; margin: 20px auto;justify-content: center;">
  
          <!-- Logo Space -->
          <div style="width: 100%; height: 150px; margin-bottom: 100px; text-align: center;">
              <img src="https://firebasestorage.googleapis.com/v0/b/eshikhay-database.appspot.com/o/IQED_Logo.png?alt=media&token=622289a0-3a68-44bc-bab7-7b372030ed93" alt="IQED Logo" 
                  style="max-width:350px; max-height: 100%; object-fit: contain;">
          </div>
  
          <!-- Title -->
          <div style="font-size: 40px; font-weight: bold; color: #004080; letter-spacing: 15px; text-align: center; margin-bottom: 20px;">
              IQ TEST RESULT
          </div>
  
          <!-- Name Space -->
          <div style="font-size: 54px; font-weight: bold; color: #004080; margin-bottom: 40px; text-align: center;">
              ${data.name}
          </div>
  
          <!-- Score Box -->
          <div style="border: 3px solid #004080; font-size: 28px; color: #004080; margin-bottom: 40px; text-align: center; ">
              IQ Score: <span style="font-weight: bold;"> ${data.score}</span>
          </div>
  
          <!-- Chart Image -->
          <div style="margin-bottom: 40px; text-align: center;background-color:#0b57d0;">
              Your score is very low (< 55). Try again!
          </div>
  
          <!-- Description -->
          <p style="margin: 40px auto 20px; font-size: 16px; color: #004080; text-align: center; width: 90%;">
              This IQ test result reflects your performance on a standardized test designed to measure cognitive abilities.
          </p>
  
          <!-- Join Us Button -->
          <div style="margin-top: 20px; text-align: center;">
              <a href="https://www.iqed.in/" target="_blank" 
                 style="text-decoration: none; background-color: #007bff; color: white; padding: 10px 20px; 
                 border-radius: 5px; font-size: 18px; display: inline-block;">
                  Join Us
              </a>
          </div>
      </div>
  
  </body>
  </html>
  
  `;
  };
  module.exports = {htmltemplte,htmltemplteno};