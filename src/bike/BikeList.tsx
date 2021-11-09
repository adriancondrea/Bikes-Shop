import React, {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonInput,
    IonLabel,
    IonList,
    IonLoading,
    IonPage,
    IonRow,
    IonSearchbar,
    IonTitle,
    IonToast,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import {getLogger} from '../core';
import {BikeContext} from './BikeProvider';
import Bike from "./Bike";
import {AuthContext} from "../auth";
import {BikeProps} from "./BikeProps";
import {Network} from "@capacitor/network";
import {isNumber} from "util";

const log = getLogger('BikeList');
const offset = 5;

const BikeList: React.FC<RouteComponentProps> = ({history}) => {
    const {logout} = useContext(AuthContext);
    const {bikes, fetching, fetchingError} = useContext(BikeContext);

    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [visibleBikes, setVisibleBikes] = useState<BikeProps[] | undefined>([]);
    const [page, setPage] = useState(offset);
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string>("");

    const {savedOffline, setSavedOffline} = useContext(BikeContext);

    const [networkStatus, setNetworkStatus] = useState<boolean>(true);
    Network.getStatus().then(status => setNetworkStatus(status.connected));
    Network.addListener('networkStatusChange', (status) => {
        setNetworkStatus(status.connected);
    })

    useEffect(() => {
        if (bikes?.length && bikes?.length > 0) {
            setPage(offset);
            fetchData();
            log(bikes);
        }
    }, [bikes]);

    useEffect(() => {
        if (bikes && filter) {
            if (filter === "0" || !isNumber(filter)) {
                setVisibleBikes(bikes);
            } else {
                setVisibleBikes(bikes.filter(each => each.price <= parseInt(filter)));
            }
        }
    }, [filter]);

    useEffect(() => {
        if (search === "") {
            setVisibleBikes(bikes);
        }
        if (bikes && search !== "") {
            setVisibleBikes(bikes.filter(each => each.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())));
        }
    }, [search]);

    function fetchData() {
        setVisibleBikes(bikes?.slice(0, page + offset));
        setPage(page + offset);
        if (bikes && page > bikes?.length) {
            setDisableInfiniteScroll(true);
            setPage(bikes.length);
        } else {
            setDisableInfiniteScroll(false);
        }
    }

    async function searchNext($event: CustomEvent<void>) {
        fetchData();
        log("pagination");
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonGrid>
                        <IonRow>
                            <IonTitle>Bikes Shop</IonTitle>
                            <IonButton onClick={handleLogout}>Logout</IonButton>
                        </IonRow>
                        <IonRow>
                            <IonSearchbar style={{width: '70%'}} placeholder="Search by name" value={search}
                                          debounce={200} onIonChange={(e) => {
                                setSearch(e.detail.value!);
                            }}/>
                            <IonInput style={{width: '20%'}} type="number" value={filter} placeholder="Filter by price"
                                      onIonChange={(e) => setFilter(e.detail.value ? e.detail.value : undefined)}/>
                            <IonChip>
                                <IonLabel
                                    color={networkStatus ? "success" : "danger"}>{networkStatus ? "Online" : "Offline"}</IonLabel>
                            </IonChip>
                        </IonRow>
                    </IonGrid>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching bikes"/>
                {visibleBikes && (
                    <IonList>
                        {Array.from(visibleBikes)
                            .filter(each => {
                                if (filter !== undefined && filter !== "0")
                                    return each.price <= parseInt(filter) && each._id !== undefined;
                                return each._id !== undefined;
                            })
                            .map(({_id, name, condition, warranty, price}) =>
                                <Bike key={_id} _id={_id} name={name} condition={condition} warranty={warranty}
                                      price={price}
                                      onEdit={id => history.push(`/bike/${id}`)}/>)}
                    </IonList>
                )}
                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                                   onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>

                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch bikes'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/bike')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
                <IonToast
                    isOpen={!!savedOffline}
                    message="Your changes will be visible on server when you get back online!"
                    duration={2000}/>
            </IonContent>
        </IonPage>
    );

    function handleLogout() {
        log("logout");
        logout?.();
    }
};

export default BikeList;
