import React, {useContext, useEffect, useState} from 'react';
import {
    IonActionSheet,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonImg,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonLoading,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {getLogger} from '../core';
import {BikeContext} from './BikeProvider';
import {RouteComponentProps} from 'react-router';
import {BikeProps} from './BikeProps';
import {camera, close, remove, trash} from "ionicons/icons";
import {Photo, usePhotoGallery} from "../hooks/usePhotoGallery";

const log = getLogger('BikeEdit');

interface BikeEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const BikeEdit: React.FC<BikeEditProps> = ({history, match}) => {
    const {bikes, saving, savingError, saveBike, deleteBike} = useContext(BikeContext);
    const [name, setName] = useState('');
    const [condition, setCondition] = useState('');
    const [warranty, setWarranty] = useState(false);
    const [price, setPrice] = useState(0);
    const [bike, setBike] = useState<BikeProps>();
    const {photos, takePhoto, deletePhoto} = usePhotoGallery();
    const [photoToDelete, setPhotoToDelete] = useState<Photo>();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const bike = bikes?.find(it => it._id === routeId);
        setBike(bike);
        if (bike) {
            setName(bike.name);
            setCondition(bike.condition);
            setWarranty(bike.warranty);
            setPrice(bike.price);
        }
    }, [match.params.id, bikes]);
    const handleSave = () => {
        const editedBike = bike ? {...bike, name, condition, warranty, price} : {
            name: name,
            condition: condition,
            warranty: warranty,
            price: price
        };
        saveBike && saveBike(editedBike).then(() => history.goBack());
    };
    log('render');

    let handleDelete = () => {
        const deletedBike = bike ? {...bike, name, condition, warranty, price} : {
            name: name,
            condition: condition,
            warranty: warranty,
            price: price
        };
        deleteBike && deleteBike(deletedBike).then(() => history.goBack());
    };

    let DeleteButton = bike ? (<IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleDelete}>
            <IonIcon icon={remove}/>
        </IonFabButton>
    </IonFab>) : null

    let pageTitle = bike ? (<IonTitle>Edit</IonTitle>) : (<IonTitle>Add</IonTitle>)

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    {pageTitle}
                    <IonButtons slot={"start"}>
                        <IonBackButton defaultHref="/bikes"/>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList>
                    <IonItem>
                        <IonLabel>Name: </IonLabel>
                        <IonInput placeholder={"enter name"} value={name}
                                  onIonChange={e => setName(e.detail.value || '')}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Condition: </IonLabel>
                        <IonInput value={condition} onIonChange={e => setCondition(e.detail.value || '')}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Warranty: </IonLabel>
                        <IonCheckbox checked={warranty} onIonChange={e => setWarranty(e.detail.checked)}/>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Price: </IonLabel>
                        <IonInput type={"number"} value={price}
                                  onIonChange={e => setPrice(Number(e.detail.value) || 0)}/>
                    </IonItem>
                </IonList>
                <IonGrid>
                    <IonRow>
                        {photos.map((photo, index) => (
                            <IonCol size="6" key={index}>
                                <IonImg onClick={() => setPhotoToDelete(photo)} src={photo.webviewPath}/>
                            </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save bike'}</div>
                )}
                {DeleteButton}
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={() => takePhoto()}>
                        <IonIcon icon={camera}/>
                    </IonFabButton>
                </IonFab>
                <IonActionSheet
                    isOpen={!!photoToDelete}
                    buttons={[{
                        text: 'Delete',
                        role: 'destructive',
                        icon: trash,
                        handler: () => {
                            if (photoToDelete) {
                                deletePhoto(photoToDelete);
                                setPhotoToDelete(undefined);
                            }
                        }
                    }, {
                        text: 'Cancel',
                        icon: close,
                        role: 'cancel'
                    }]}
                    onDidDismiss={() => setPhotoToDelete(undefined)}
                />
            </IonContent>
        </IonPage>
    );
};

export default BikeEdit;
