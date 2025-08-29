
import React, { useState, useEffect, type ReactNode } from 'react';

import { chatWithAgent } from '../Api/chat';
import StatusSlider from './StatusSlider';
import { listMyTaskAssignments, updateTaskAssignment, type TaskAssignment } from '../Api/tasks';

// Inline component to show and control a task's status inside chat
function TaskStatusSliderMessage({ taskId }: { taskId: number }) {
  const STATUSES: TaskAssignment['status'][] = ['assigned', 'todo', 'in progress', 'sent for approval', 'approved', 'done']
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<number>(0)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const tasks = await listMyTaskAssignments()
        if (!mounted) return
        const t = tasks.find((x) => x.id === taskId)
        if (!t) {
          setError(`Task ${taskId} not found in your assignments`)
          setLoading(false)
          return
        }
        const idx = t.status ? Math.max(0, STATUSES.indexOf(t.status)) : 0
        setValue(idx === -1 ? 0 : idx)
      } catch (e: any) {
        setError(e?.message || 'Failed to load task')
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [taskId])

  const handleChange = async (nextIndex: number) => {
    setValue(nextIndex)
    const nextStatus = STATUSES[Math.max(0, Math.min(STATUSES.length - 1, nextIndex))] || 'todo'
    try {
      await updateTaskAssignment(taskId, { status: nextStatus })
    } catch (e) {
      // revert on error
      setValue((prev) => prev)
    }
  }

  return (
    <div className="p-2 bg-green-50 rounded-lg border border-green-200">
      <div className="text-sm text-gray-700 mb-1">AI: Here is the current status for task #{taskId}.</div>
      {loading && <div className="text-sm text-gray-500">Loading status…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <StatusSlider
          id={`task-status-${taskId}`}
          statuses={STATUSES as unknown as string[]}
          value={value}
          onChange={handleChange}
          label={`Task #${taskId} status`}
        />
      )}
    </div>
  )
}

const ChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ReactNode[]>([]);
  const [input, setInput] = useState<string>('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = input;
      setMessages((prevMessages) => [...prevMessages, `You: ${userMessage}`]);
      setInput('');

      try {
        // Detect queries like: "what is the status of the task with id 2"
        const match = userMessage.match(/status\s+of\s+the\s+task\s+with\s+id\s+(\d+)/i) ||
                      userMessage.match(/status\s+of\s+task\s+#?(\d+)/i) ||
                      userMessage.match(/task\s+#?(\d+)\s+status/i)

        if (match?.[1]) {
          const taskId = parseInt(match[1], 10)
          setMessages((prev) => [...prev, <TaskStatusSliderMessage key={`task-${taskId}-${Date.now()}`} taskId={taskId} />])
          return
        }

        const agentResponse = await chatWithAgent(userMessage);
        setMessages((prevMessages) => [...prevMessages, `AI: ${agentResponse}`]);
      } catch (error) {
        setMessages((prevMessages) => [...prevMessages, `AI: Error processing your request.`]);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Bubble */}
      <div
        className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center cursor-pointer shadow-lg"
        onClick={toggleChat}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>

      {/* Chat Dialog */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[534px] h-[650px] bg-white rounded-lg shadow-xl flex flex-col">
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Chat</h3>
            <button onClick={toggleChat} className="text-white text-xl font-bold">
              &times;
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto border-b border-gray-200">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center mt-4">No messages yet.</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-100 rounded-lg">
                  {msg}
                </div>
              ))
            )}
          </div>
          <div className="p-3 flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <button
              className="bg-blue-500 text-white rounded-r-lg px-4 py-2 ml-1 hover:bg-blue-600"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
