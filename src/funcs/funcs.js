import { debugResource } from "../components/Constants"

export const postRequestToServer = (pagePath, requestObj, beforeRequestAction = () => { }, afterRequestAction = () => { }, finallyAction = () => { }) => {

    beforeRequestAction();

    (async () => {

        console.log(pagePath)

        let response = await fetch(debugResource + pagePath, {
            method: 'POST',
            body: requestObj
        })

        console.log(response)

        return await response.json()
    })().then(afterRequestAction).finally(finallyAction)
}

export const jsonPostRequestToServer = (pagePath, requestJsonObj, beforeRequestAction = () => { }, afterRequestAction = () => { }, finallyAction = () => { }) => {

    postRequestToServer(pagePath, JSON.stringify(requestJsonObj), beforeRequestAction, afterRequestAction, finallyAction)

    // beforeRequestAction();

    // (async () => {

    //     let response = await fetch(debugResource + pagePath, {
    //         method: 'POST',
    //         body: JSON.stringify(requestJsonObj)
    //     })

    //     return await response.json()
    // })().then(afterRequestAction).finally(finallyAction)
}