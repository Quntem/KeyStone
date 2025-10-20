# keystone-lib

keystone-lib is a library that allows you to authenticate users and access protected resources

## How to use

on the frontend, you will need to import the library and use the useAuth hook

```javascript
import {useAuth} from "keystone-lib";

export default function App() {
    const auth = useAuth({appId: "", keystoneUrl: ""}); // you will need to provide your app id and keystone url from the keystone admin panel
    return (
        <div>
            <h1>App</h1>
            <div>Auth: {JSON.stringify(auth.data)}</div>
        </div>
    );
}
```

on the backend, you will need to import the library and use the VerifySession function

```javascript
import {VerifySession} from "keystone-lib";

export function GET(request: NextRequest) {
    const sessionId = request.headers.get("Authorization")?.split(" ")[1];
    console.log(sessionId);
    const verifiedSession = await VerifySession({ sessionId: sessionId!, appSecret: "", appId: "", keystoneUrl: "" }); // you will need to provide your app id, app secret, and keystone url from the keystone admin panel
    return NextResponse.json(verifiedSession);
}
```

make sure you pass the session id to the function, this is not done automatically


