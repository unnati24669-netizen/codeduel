import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { languages } from "./matchroom";
import { groqAPIreview, groqchatContinuation } from "../api/groqApi";

function Me({ username, ratingChange, status }) {
  const isWinner = status === "Winner";
  return (
    <div className="flex-1 bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h1 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isWinner ? "text-emerald-400" : "text-red-400"}`}>
        {status}
      </h1>
      <div className="text-lg font-medium text-slate-100">{username}</div>
      <div className={`text-sm mt-1 ${ratingChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
        {ratingChange >= 0 ? "+" : ""}{ratingChange}
      </div>
    </div>
  );
}

function GroqReview({ code, languageId, setGroq }) {
  const question = useSelector((state) => state.match.question);
  const language = languages.find((language) => language.languageId === languageId);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const requiredQuestion = question
    ? {
        title: question.title,
        description: question.description,
        timeLimit: question.timeLimit,
      }
    : null;

  useEffect(() => {
    const callGroq = async () => {
      try {
        if (!code) {
          setError(new Error("No code is available for review."));
          return;
        }
        if (!languageId || !language) {
          setError(new Error("Language information is unavailable."));
          return;
        }
        if (!requiredQuestion || !requiredQuestion.description) {
          setError(new Error("Question information is unavailable."));
          return;
        }

        const questionText = `${requiredQuestion.title}\n\n${requiredQuestion.description}\n\nTime Limit: ${requiredQuestion.timeLimit}`;
        const reviewResponse = await groqAPIreview({ code, question: questionText, language: language.name });
        if (reviewResponse) {
          setHistory((prev) => [...prev, reviewResponse]);
        }
      } catch (err) {
        console.log(err);
        setError(err);
      }
    };
    callGroq();
  }, [code, languageId, language, requiredQuestion]);

  async function chatContinue() {
    try {
      const chatResponse = await groqchatContinuation({ input, history });
      if (chatResponse) {
        setHistory((prev) => [...prev, chatResponse]);
      }
      setInput("");
    } catch (err) {
      console.log(err);
      setError(err);
    }
  }

  return (
    <div className="mt-6 bg-slate-800 rounded-lg border border-slate-700 flex flex-col max-h-96">
      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <span className="text-slate-200 font-medium">AI Review</span>
        <button
          onClick={() => setGroq(false)}
          className="text-slate-400 hover:text-slate-100 text-xl leading-none"
        >
          −
        </button>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto">
        {history.map((data, key) => (
          <div key={key} className="bg-slate-900 rounded-md p-3 text-slate-200 text-sm">
            {data.content}
          </div>
        ))}
      </div>

      {error && (
        <div className="px-4 pb-2 text-red-400 text-sm">Error: {error.message}</div>
      )}

      <div className="flex gap-2 p-4 border-t border-slate-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={chatContinue}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default function Result() {
  const [groq, setGroq] = useState(false);
  let my_code;
  let my_languageId;

  const my_id = useSelector((state) => state.auth.user._id);
  const players = useSelector((state) => state.match.players);
  const winner = useSelector((state) => state.match.winner);
  let my_username;
  let opponent_username;
  let abandon = false;

  let my_ratingChange;
  let opponent_ratingChange;
  let my_status;
  let opponent_status;

  players.forEach((player) => {
    if (player.playerId === my_id) {
      my_username = player.username;
      my_ratingChange = player.newRating - player.rating;
      my_code = player.code;
      my_languageId = player.languageId;
    } else {
      opponent_username = player.username;
      opponent_ratingChange = player.newRating - player.rating;
    }
  });

  if (winner == null) {
    abandon = true;
  } else if (winner === my_id) {
    my_status = "Winner";
    opponent_status = "Loser";
  } else {
    my_status = "Loser";
    opponent_status = "Winner";
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          {abandon ? (
            <p className="text-amber-400 font-medium">Abandoned</p>
          ) : (
            <p className="text-slate-400 font-medium">Completed</p>
          )}
        </div>

        <div className="flex gap-4">
          <Me username={my_username} ratingChange={my_ratingChange} status={my_status} />
          <Me username={opponent_username} ratingChange={opponent_ratingChange} status={opponent_status} />
        </div>

        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-medium py-2 rounded-md">
            Rematch
          </button>
          <button
            onClick={() => setGroq(true)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-md"
          >
            Review
          </button>
        </div>

        {groq && (
          <GroqReview code={my_code} languageId={my_languageId} setGroq={setGroq} />
        )}
      </div>
    </div>
  );
}