# TCP Server and Client with Node JS

It is a simple TCP Server and Client project. 
It checks the connection between the client and server every 5 seconds and sends a heartbeat. 
If there is a problem with the connection, it tries to connect again.
While you can send messages to all clients, you can also send messages only to the clients you select. 
There is no communication between clients. 
If you send an exit or close message, the client connection ends.
