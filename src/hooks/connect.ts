import { useState, useEffect } from 'react';
import { Storage, Drivers } from '@ionic/storage';


//TODO: Split the following class in connect and utils
//TODO: change methods' behavior from testing to prod
export function Connect() {

    const [notes, setNotes] = useState<Note[]>([]);
    const [usedDB, setUsedDB] = useState(false);
    const [currentFilter, setCurrentFilter] = useState('');
    const [labels, setLabels] = useState<Array<string>>([]);

    const sampleNotes = [
        "Fazer compras no mercado",
        "Lavar o carro",
        "Assistir novo filme",
        "Comprar terno para o casamamento do fiote",
        "Ligar para o tio"
    ]

    useEffect(() => {
        const initNotes = async () => {
            await getNotes()
        }
        initNotes()
    }, [])

    useEffect (() => {
        const updateLabels = async () => {
            await getLabels()
        }
        updateLabels()
    }, [])

    useEffect(() => {
        const updateNotes = async () => {
            await getNotes()
        }
        updateNotes()
        setUsedDB(false)
    }, [usedDB])

    const connectDB = async () => {
        const db = new Storage({
            name: "__teste",
            driverOrder: [Drivers.LocalStorage, Drivers.IndexedDB]
        })
        await db.create()
        return db
    }

    const addNote = async (note: string) => {
        const db = await connectDB()
        let key = (await db.length() + 1).toString()
        let tempNote = 
            { 
                note: note,
                priority: generateRandomInt(3),
                status: Status.Pendent,
                date: new Date(2024, 0, 
                        generateRandomInt(30)),
                labels: [],
            }
        db.set(key, tempNote)
        setUsedDB(true)
        //setNotes([...notes, createNote(tempNote, key)])
    }

    const completeNote = async (id: string) => {
        let note = await getNote(id)
        note.status = Status.Completed

        await updateNote(id, note)
    }

    const updateNote = async (id: string, note: NoteDB) => {
        let tempNote = await getNote(id)
        
        note.date = tempNote.date

        const db = await connectDB()
        db.set(
            id,
            note
        )
        setUsedDB(true)
    }

    const getNote = async (id: string) : Promise<NoteDB> => {
        const db = await connectDB()
        return await db.get(id)
    }

    const populate = async () => {
        for (let i = 0; i < 40; i++) {
            await addNote(sampleNotes[generateRandomInt(5)])
        }
    }

    const truncate = async (pop?: boolean) => {
        const db = await connectDB()
        db.clear()

        if (pop == true)
            populate()
    }

   const createNote = (note: NoteDB, key?: string) => {
    let noteDate = new Date(note.date)
    let dayMonth: [number, number] =
        [noteDate.getDate(), noteDate.getMonth()]

    return {
        key: key,
        note: note.note,
        priority: note.priority,
        status: note.status,
        date: howManyDays(...dayMonth),
        howMany: createStringDate(+howManyDays(...dayMonth)),
        labels: note.labels,
        } as Note
   } 

    const applyFilter = (note: Note) : boolean => {
        return note.status == 0 ? true : false
   }

    const getNotes = async (filter: boolean = true) => {
        const db = await connectDB()
        const keys = await db.keys()

        const newNotes: Note[] = []

        for (let key of keys) {
            let tempNote = await db.get(key)
            if (filter) {
                if (applyFilter(tempNote)) {
                    newNotes.push(createNote(tempNote, key))
                }
            } else {
                newNotes.push(createNote(tempNote, key))
            }
        }

        setNotes(newNotes);
    }

    const createStringDate = (days: number) => {
        if (days < 8)
            return days > 1 ? days + " days" : days + " day"
        // TODO: change color of "how much times has passed" string as:
                //9 days, 1 week and 2 days, so light color
                //12 days, less than 2 weeks but almost there, so darker color
        else
            var int = Math.round(days / 7)
            return int > 1 ? int + " weeks" : int + " week"
    }

    const howManyDays = (day: number, month: number) => {
        let today = new Date().getDate()
        let monthf = new Date().getMonth()

        today = 31 * monthf + today
        let compare = 31 * month + day

        return (today - compare).toString()
    }

    const generateRandomInt = (int: number) => {
        return Math.floor(Math.random() * int)
    }

    const createLabel = async (label: string) => {
        const db = await connectDB()
        let labels: Array<string> = await db.get('labels')

        if (!labels)
            db.set('labels', [label])
        else if (labels && labels.includes(label))
            return
        else
            db.set('labels', [...labels, label])

        setLabels(await db.get('labels'))
    }

    const getLabels = async () =>
    {
        const db = await connectDB()
        setLabels(await db.get('labels'))
    }

    return {
        addNote, truncate, getNotes, updateNote, getNote,
        completeNote, getLabels, createLabel,
        notes, Priority, Status, labels
    }

}

export interface Note {
    key: string,
    note: string;
    priority: number,
    status: number,
    date: string;
    howMany: string;
    labels: [];
}

export interface NoteDB {
    note: string;
    priority: number,
    status: number,
    date: string;
    labels: [];
}

export enum Priority {
    Baixa = 0,
    Média = 1,
    Alta = 2,
    //__LENGTH
}

export enum Status {
    Pendent = 0,
    Completed = 1
}