import React, {useContext, useEffect, useState} from 'react';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {getLogger} from '../core';
import {BikeContext} from './BikeProvider';
import {RouteComponentProps} from 'react-router';
import {BikeProps} from './BikeProps';
import {remove} from "ionicons/icons";

const log = getLogger('BikeEdit');

interface BikeEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const BikeEdit: React.FC<BikeEditProps> = ({history, match}) => {
    const {bikes, saving, savingError, saveBike} = useContext(BikeContext);
    const [name, setName] = useState('');
    const [condition, setCondition] = useState('');
    const [warranty, setWarranty] = useState(false);
    const [price, setPrice] = useState(0);
    const [bike, setBike] = useState<BikeProps>();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const bike = bikes?.find(it => it.id === routeId);
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

    let DeleteButton = bike ? (<IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton>
            <IonIcon icon={remove}/>
        </IonFabButton>
    </IonFab>) : null

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
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
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save bike'}</div>
                )}
                {DeleteButton}
            </IonContent>
        </IonPage>
    );
};

export default BikeEdit;
