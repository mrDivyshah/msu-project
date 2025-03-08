import { useState, useRef, useEffect } from "react";
import { Paperclip, Smile } from "lucide-react";

export default function ConfessionForm({ onSubmit }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const audioRef = useRef(null); // Reference for audio

  // Function to auto-resize the textarea with a scrollbar
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust height dynamically
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await onSubmit(message);

    // Play send sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset sound if played multiple times
      audioRef.current.play();
    }

    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full mx-auto bg-gray-800 rounded-xl"
    >
      {/* Hidden Audio Element for Sending Sound */}
      <audio ref={audioRef} src="/sounds/send.mp3" preload="auto"></audio>

      <div className="rounded-xl px-4 py-4 bg-transparent shadow-md">
        {/* Auto-Expanding Textarea */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            className="w-full p-2 text-sm bg-transparent outline-none resize-none overflow-y-auto max-h-40 min-h-[40px] 
                       scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
            placeholder="Write your Message..."
            value={message}
            rows={1}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>

        {/* Attach File & Submit Button */}
        <div className="flex justify-center align-middle items-center">
          <div className="flex-1">
            <button type="button" className="text-gray-500 hover:text-gray-700">
              <Paperclip size={20} />
            </button>

            {/* Emoji Icon */}
            <button
              type="button"
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <Smile size={20} />
            </button>
          </div>

          {/* Submit Button Always at Bottom */}
          <div className="flex items-end">
            <button
              type="submit"
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={!message.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
