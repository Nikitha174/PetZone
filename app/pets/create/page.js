import PetForm from '@/components/pets/PetForm';

export default function CreatePetPage() {
    return (
        <main className="container" style={{ padding: '4rem 1.5rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Add a New Pet</h1>
            <PetForm />
        </main>
    );
}
