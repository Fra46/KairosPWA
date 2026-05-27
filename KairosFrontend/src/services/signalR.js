// src/services/signalR.js
import * as signalR from '@microsoft/signalr';

let connection = null;

export const startConnection = async () => {
    if (connection) return connection;

    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const hubUrl = `${protocol}://${window.location.hostname}:7300/Hubs/NotificationsHub`;

    connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .build();

    await connection.start();
    return connection;
};

export const getConnection = () => connection;
