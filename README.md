/**
1. The kind of API chosen, and why, and how it compares with other popular solutions.
=>
I have completed the assessment with help of nodejs and used restAPI as my solutions because in my opinion I think the restapi is a simpler and more flexible method for building APIs that can transfer data in a variety of formats, including XML as well as plain text, HTML, and JSON and rest api too comes with some disadvantages like overfetching and underfetching which can be handled by using GraphQl as the solution .

2. The kind of authentication mechanism chosen, and why.
=>
I have used JWT as my way of authenticationand reasons to chose it would be  asJWT is such a popular standard:
 The JWT can contain the user’s details. So you don’t need to query a database / auth server for that information on each request.They offer strong security guarantees. 
JWTs are stored only on the client. You generate JWTs on the server and send them to the client. The client then submits the JWT with every request. This saves database space.


3.The database chosen (please don’t use MongoDB unless you have very strong justifications to do so – and if you do, please include sufficient links to trusted resources), and why, including performance considerations.
=>
I have choosen sql based database as my DB for the assesment because sql databases makes the relation between the tables more efficent and faster while fetching and creation.MySQL concept does not allow efficient replication and sharding but in MySQL one can access associated data using joins which minimizes duplication.
and data too is storedin form of table and rows which make relation between tables easier.

**/
