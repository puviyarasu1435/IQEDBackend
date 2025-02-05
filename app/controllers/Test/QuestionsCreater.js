const { default: OpenAI } = require("openai");



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



async function generateMathQuestions(topic, difficulty, questionType, numQuestions) {
    const messages = [
      { role: "system", content: "You are an AI that generates math quiz questions in JSON format." },
      { role: "user", content: `Generate ${numQuestions} ${difficulty} level ${questionType} questions for ${topic}.` }
    ];
  
    const functionDefinitions = [
      {
        name: "generate_math_question",
        description: "Generates a math question in JSON format.",
        parameters: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["text-image"] },
            question: { type: "string" },
            questionImage: { type: "string" },
            options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["text"] },
                  content: { type: "string" }
                },
                required: ["type", "content"]
              }
            },
            correctAnswer: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["text"] },
                content: { type: "string" },
                index: { type: "integer" },
                explanation: { type: "string" }
              },
              required: ["type", "content", "index", "explanation"]
            },
            difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            topics: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["type", "question", "questionImage", "options", "correctAnswer", "difficulty", "topics"]
        }
      }
    ];
  
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: messages,
        functions: functionDefinitions,
        function_call: "auto",
      });
  
      const responseData = response.choices[0].message.function_call.arguments;
      return JSON.parse(responseData);
    } catch (error) {
      console.error("Error generating math questions:", error);
      return { error: "Failed to generate questions" };
    }
  }
  
async function GenerateQuestions (req, res){
    const { topic, difficulty, questionType, numQuestions } = req.body;
    console.log(req.body)
    if (!topic || !difficulty || !questionType || !numQuestions) {
      return res.status(400).json({ error: "Missing required query parameters" });
    }
    const questions = [];
    for (let i = 0; i < parseInt(numQuestions); i++) {
      const question = await generateMathQuestions(topic, difficulty, questionType, 1);
      questions.push(question);
    }
  
    res.status(200).json(questions);
}

module.exports = {GenerateQuestions}