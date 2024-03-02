import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput,
          IonItem, IonList, IonLabel, IonButton, IonPopover, IonSelect, 
          IonSelectOption, IonFooter, IonMenuButton, IonButtons
        } from '@ionic/react';
import React, { useState, useRef } from 'react';

import { add, remove } from 'ionicons/icons';
import { Connect, Note, NoteDB } from '../hooks/connect';

import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

const Home: React.FC = () => {

  const { addNote, getNotes, truncate, getNote, updateNote,
          completeNote, createLabel,
            Status, Priority, notes, labels } = Connect();

  const pop = useRef<HTMLIonPopoverElement>(null);
  const input = useRef<HTMLIonInputElement>(null);
  const select = useRef<HTMLIonSelectElement>(null);

  const [itemInfos, setItemInfos] = useState<Note>({} as Note);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const colors: { [index: string]: string } =
  { 0: "low", 1: "mid", 2: "high" }

  const defineColor = (priority: number, days: string) => {
    return colors[priority] + (+days < 8 ? '-1' : +days > 21 ? '-3' : '-2')
  }

  const sortArrayAsc = (ar: Note[]) => {
    return [...notes].sort((a, b) => +a.date! < +b.date! ? 1 : -1, );
  }

  const openPopover = (e: any, note: Note) => {
    setItemInfos(note)

    if (!popoverOpen)
      setPopoverOpen(true);
  };

  const closePopover = (e: any) => {
    if (popoverOpen)
      setPopoverOpen(false);
  }

  const sendUpdate = (key: string) => {
    updateNote(key,
      {
      note: input.current?.value,
      priority: select.current?.value,
      status: 0
    } as NoteDB)
  }


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton autoHide={false}></IonMenuButton>
          </IonButtons>
          <IonTitle>Tecle</IonTitle>
          {labels?.map((label: string, index: number) => (
          <IonButtons key={index} slot="primary">
            <IonButton fill="outline">
              {label}
            </IonButton>
          </IonButtons>
          ))}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList lines="none">
          {(sortArrayAsc(notes)).map((note, index) => (

          <IonItem key={+note.key!} 
                  className={defineColor(note.priority!, note.date!)}
                  button={true} 
                  onClick={(e) => {openPopover(e, note)}}>

            <IonLabel class='how-much'>{note.howMany}
            </IonLabel>
            <IonLabel id={note.key!}>
              {note.note}
            </IonLabel>
          </IonItem>
          ))}
        </IonList>

        <IonPopover isOpen={popoverOpen} ref={pop}
            //onDidDismiss={closePopover}
            onIonPopoverDidDismiss={closePopover}
            reference='event' side='bottom' alignment='center'
            backdropDismiss={true} 
            >
          <IonContent class="ion-padding">
            <IonItem>

              <IonInput 
                ref={input} value={itemInfos.note} type='text'
                onIonInput={(e) => setItemInfos(
                  {...itemInfos,
                  note: e.target.value?.toString() ?? ""}
              )}>
              </IonInput>
            </IonItem>

            <IonList>
              <IonItem>
                <IonSelect ref={select}
                   label="Prioridade" interface="popover"
                   expandedIcon={remove} labelPlacement='stacked' 
                   value={itemInfos.priority}
                    onIonChange={(e) => setItemInfos(
                  {...itemInfos,
                  priority: (e.target as HTMLIonSelectElement).value}
              )}>

                  {Object.keys(Priority)
                         .filter((key) => isNaN(Number(key)))
                            .map((value, index) => (
                  <IonSelectOption key={index} value={index}>
                    {value}
                  </IonSelectOption>
                  ))}

                </IonSelect>
              </IonItem>
            </IonList>

            <IonButton onClick={(e) => {
                    completeNote(itemInfos.key)
                    closePopover(e)}}>
              Concluir
            </IonButton>

            <IonButton onClick={(e) => { 
                    sendUpdate(itemInfos.key) 
                    closePopover(e)}}>
              Go
            </IonButton>
          </IonContent>
        </IonPopover>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonItem>
          <IonInput class="main-input" placeholder="Tecle aí" 
            shape="round" label='>' type='text' defaultValue='kk' onKeyUp={(e) => {
              if (e.code === "Enter") {
                let value = (e.target as HTMLInputElement).value;
                (e.target as HTMLInputElement).value = ''

                if (value == 'drop all') {
                  truncate()
                  return
                } else if (value == 'populate') {
                  truncate(true)
                  return
                } else if (value.includes('label')) {
                  createLabel(value)
                  return
                }

                if (value !== '')
                  addNote(value)
              }
            }
          }
            >

          </IonInput>
          </IonItem>
        </IonToolbar>
      </IonFooter>

    </IonPage>
  );
};

export default Home;
