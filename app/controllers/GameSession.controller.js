const { GameSessionModel, UserModel } = require("../models");

async function getGameSession(req, res) {
  try {
    const { GameSessionId, SocketId } = req.body;
    console.log(req.body);
    if (!GameSessionId) {
      return res.status(400).json({ message: "Invalid session ID provided." });
    }

    const session = await GameSessionModel.findById(GameSessionId)
      .populate("questionsList")
      .exec();
    const player = session.Players.find((p) => p.SocketId === SocketId);
    if (!player) {
      return res.status(404).json({ message: "Player not found in session." });
    }
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }
    console.log(player);
    res.status(200).json({
      Players: session.Players,
      SocketId: SocketId,
      status: player.status,
      questionsList: session.questionsList,
      Topics: session.Topic,
      questionCount: session.questionCount,
      Winner: session.Winner,
      score: player.score,
      timeTaken: player.timeTaken,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving session", error });
  }
}

async function updateGameSessionAnswers(req, res) {
  try {
    const { GameSessionId, SocketId, answeredQuestions, timeTaken } = req.body;
    if (
      !GameSessionId ||
      !SocketId ||
      !answeredQuestions ||
      !Array.isArray(answeredQuestions)
    ) {
      return res.status(400).json({ message: "Invalid answers provided." });
    }

    // Fetch session
    const session = await GameSessionModel.findById(GameSessionId).populate(
      "questionsList"
    );
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    // Find the player
    const player = session.Players.find((p) => p.SocketId === SocketId);
    if (!player) {
      return res.status(404).json({ message: "Player not found in session." });
    }
    
    // Update player's answered questions and score
    player.answeredQuestions = answeredQuestions;
    player.score = answeredQuestions.reduce((score, answer) => {
      const question = session.questionsList.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      return question && answer.correct ? score + 1 : score;
    }, 0);
    player.timeTaken = timeTaken;
    player.status = "completed";
    
    // Check if all players have completed
    if (session.Players.every((p) => p.status === "completed")) {
      session.status = "completed";
      
      // Determine winner
      const [player1, player2] = session.Players;
      if (player1.score > player2.score) {
        session.Winner = 0; // Player 1 wins
      } else if (player1.score < player2.score) {
        session.Winner = 1; // Player 2 wins
      } else {
        session.Winner = null; // Tie
      }
    }
    await session.save();
    console.log(session);
    res.status(200).json({
      Players: session.Players,
      SocketId: player.SocketId,
      status: player.status,
      questionsList: player.questionsList,
      Topics: session.Topic,
      questionCount: session.questionCount,
      Winner: session.Winner,
      score: player.score,
      timeTaken: player.timeTaken,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating session answers", error });
  }
}

module.exports = {
  getGameSession,
  updateGameSessionAnswers,
};
