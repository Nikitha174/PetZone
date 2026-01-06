import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatPage() {
    return (
        <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <h1 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Pet Care Expert</h1>
            <ChatWindow />
        </main>
    );
}
