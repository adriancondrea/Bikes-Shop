import React, {useContext, useState} from 'react';
import {createAnimation, IonButton, IonCol, IonGrid, IonModal, IonRow, IonTitle} from '@ionic/react';
import {BikeContext} from "../bike/BikeProvider";
import {AuthContext} from "../auth";

export const LogoutButton: React.FC = () => {
    const {bikes} = useContext(BikeContext);
    const {logout} = useContext(AuthContext);

    const [showModal, setShowModal] = useState(false);

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                {offset: 0, opacity: '0', transform: 'scale(0)'},
                {offset: 1, opacity: '0.99', transform: 'scale(1)'}
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    const doLogout = async () => {
        bikes?.splice(0);
        logout?.();
    };

    return (
        <>
            <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                <IonTitle className="ion-align-self-center">Are you sure you want to log out?</IonTitle>
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonButton onClick={doLogout}>Log out</IonButton>
                        </IonCol>
                        <IonCol>
                            <IonButton onClick={() => setShowModal(false)}>Cancel</IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonModal>
            <IonButton onClick={() => setShowModal(true)}>Log out</IonButton>
        </>
    );
};
