/**
 * Here you can define helper functions to use across your app.
 */
export default function delay(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(function(){
            resolve()
        }, seconds * 1000);
    }
    )
}