import { json, redirect } from "@remix-run/node"
import NewNote, { links as newNoteLinks } from "../components/NewNote"
import { getStoredNotes, storeNotes } from "../data/notes"
import NoteList, { links as noteListLink } from "../components/NoteList"
import { useLoaderData, Link, useCatch } from "@remix-run/react"


export default function NotesPage() {
    const notes = useLoaderData()

    return (
        <main>
            <NewNote />
            <NoteList notes={notes} />
        </main>
    )
}

export async function loader() {
    const notes = await getStoredNotes()
    if (!notes || notes.length === 0) {
        throw json(
            { message: 'Could not find any notes.' },
            {
                status: 404,
                statusText: 'Not Found',
            }
        );
    }
    return notes
}

export async function action({ request }) {
    const formData = await request.formData()
    const noteData = {
        title: formData.get('title'),
        content: formData.get('content')
    }

    if (noteData.title.trim().length < 5) {
        return { message: 'Invalid title - must be at least 5 charachters long' }
    }

    const existingNotes = await getStoredNotes()
    noteData.id = new Date().toISOString()
    const updatedNotes = existingNotes.concat(noteData)
    await storeNotes(updatedNotes)
    return redirect("/notes")
}

export function CatchBoundary() {
    const caughtResponse = useCatch()

    const message = caughtResponse.data?.message || 'Data not found'

    return (
        <main>
            <NewNote />
            <p className="info-message">{message}</p>
        </main>
    )
}

export function ErrorBoundary({ error }) {
    return (
        <main className="error">
            <h1>An error related to your notes occured</h1>
            <p>{error.message}</p>
            <p>Back to <Link to="/">Safety!</Link></p>
        </main>
    )
}

export function links() {
    return [...newNoteLinks(), ...noteListLink()]
}

export function meta(){
    return{
        title: "All notes",
        description: "Manage your notes here"
    }
}