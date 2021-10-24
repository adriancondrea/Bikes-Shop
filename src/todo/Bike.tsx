import React from 'react';
import {IonItem, IonLabel} from '@ionic/react';
import {BikeProps} from './BikeProps';

interface BikePropsExt extends BikeProps {
    onEdit: (id?: string) => void;
}

const Bike: React.FC<BikePropsExt> = ({id, name, condition, warranty, price, onEdit}) => {
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{name}</IonLabel>
            <IonLabel>{condition}</IonLabel>
            {/*TODO: investigate how you can display warranty here*/}
            <IonLabel>{String(warranty)}</IonLabel>
            <IonLabel>{price}</IonLabel>
        </IonItem>
    );
};

export default Bike;
