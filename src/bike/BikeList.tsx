import React, {useContext} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonList,
    IonLoading,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import {getLogger} from '../core';
import {BikeContext} from './BikeProvider';
import Bike from "./Bike";

const log = getLogger('BikeList');

const BikeList: React.FC<RouteComponentProps> = ({history}) => {
    const {bikes, fetching, fetchingError} = useContext(BikeContext);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonGrid>
                        <IonRow>
                            <IonTitle>Bikes Shop</IonTitle>
                            <IonButton>Logout</IonButton>
                        </IonRow>
                    </IonGrid>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items"/>
                {bikes && (
                    <IonList>
                        {bikes.map(({_id, name, condition, warranty, price}) =>
                            <Bike key={_id} _id={_id} name={name} condition={condition} warranty={warranty}
                                  price={price}
                                  onEdit={id => history.push(`/bike/${id}`)}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch bikes'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/bike')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default BikeList;
