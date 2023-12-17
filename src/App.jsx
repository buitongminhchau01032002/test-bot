import { useEffect } from 'react';
import { useState } from 'react';

const TOKEN = 'dSx0OKtPQXM.TeM121P-aiAtJcl6cJNJ8iT3tjNMC3M-OZ0X2VuQLWw';

function BotMessageItem({ message, onActionClick }) {
    return (
        <div>
            <p>Bot:</p>
            <p>{message.text}</p>
            {message?.suggestedActions &&
                message.suggestedActions?.actions?.map((action, index) => (
                    <button key={index} onClick={() => onActionClick(action.value)}>
                        {action.title}
                    </button>
                ))}
        </div>
    );
}

function ChatBox({ conversationId }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');

    function handleSendMessage(value) {
        console.log(value);
        setMessages((prev) => [
            ...prev,
            {
                isFromMe: true,
                text: value,
            },
        ]);
        fetch(
            `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + TOKEN,
                },
                body: JSON.stringify({
                    locale: 'en-EN',
                    type: 'message',
                    from: {
                        id: 'user1',
                    },
                    text: value,
                }),
            }
        )
            .then((res) => res.json())
            .then((resJson) => {
                if (!resJson?.id) return;
                const watermark = resJson.id.split('|')[1];
                fetch(
                    `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities?watermark=${watermark}`,
                    {
                        headers: {
                            Authorization: 'Bearer ' + TOKEN,
                        },
                    }
                )
                    .then((res) => res.json())
                    .then((resJson) => {
                        const _messages = resJson.activities;
                        setMessages((prev) => [...prev, ..._messages]);
                    });
            });
    }
    return (
        conversationId && (
            <div>
                {messages.map((m, index) =>
                    m.isFromMe ? (
                        <div key={index}>Me: {m.text}</div>
                    ) : (
                        <BotMessageItem key={index} message={m} onActionClick={handleSendMessage} />
                    )
                )}

                <div>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button onClick={() => handleSendMessage(inputValue)}>Send</button>
                </div>
            </div>
        )
    );
}

function App() {
    const [conversationId, setConversationId] = useState(null);
    useEffect(() => {
        // Start conversation
        fetch('https://directline.botframework.com/v3/directline/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + TOKEN,
            },
        })
            .then((res) => res.json())
            .then((resJson) => {
                setConversationId(resJson?.conversationId);
            });
    }, []);
    return <ChatBox conversationId={conversationId} />;
}

export default App;
