import React from 'react';
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
    IonImg,
    IonLabel
} from '@ionic/react';
import {BikeProps} from './BikeProps';
import BikeImage from "../assets/img/bike.jpeg";
import {closeCircle, shieldCheckmarkOutline} from "ionicons/icons";

interface BikePropsExt extends BikeProps {
    onEdit: (_id?: string) => void;
}

const Bike: React.FC<BikePropsExt> = ({_id, name, condition, warranty, price, onEdit}) => {
    return (
        <IonCard onClick={() => onEdit(_id)}>
            <IonImg src={BikeImage} alt={"bike"}/>
            <IonCardHeader>
                <IonCardTitle>{name}</IonCardTitle>
                <IonCardSubtitle>Price: {price}$</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
                <IonLabel>Condition: {condition}</IonLabel>
                <br/>
                <IonLabel>Warranty: {warranty ? (<IonIcon icon={shieldCheckmarkOutline}/>) :
                    (<IonIcon icon={closeCircle}/>)} </IonLabel>
            </IonCardContent>
        </IonCard>
    );
};

export default Bike;
