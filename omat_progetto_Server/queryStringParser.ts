function parseQueryString(req: any, res: any, next: any) {
    // con questa funzione andiamo a modificare req.query, parsificando ogni valore.
    req['parsedQuery'] = {}
    if (req['query'] && typeof req['query'] == 'object') {
        for (const key in req['query']) {
            const value = req['query'][key]
            req['parsedQuery'][key] = parseValue(value)
        }
    }
    next()
}

function parseValue(value: any): any {
    if (Array.isArray(value)) return value.map(parseValue);

    if (value == 'true')
        return true
    if (value == 'false')
        return false

    // simile a parseInt, ma Number restituisce il numero solo se la stringa è completamente numerica.
    // esempio: "15a" --> NaN
    // mentre parseInt restituisce il primo carattere numerico che trova, restituirebbe quindi 15.
    const num = Number(value) // Number accetta interi e decimali
    if (!isNaN(num)) // se è un numero valido
        return num
    //if (typeof num == 'number') --> typeof NaN restituisce number
    //  return num

    if (typeof value == 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
            return JSON.parse(value)
        }
        catch (error) {
            return value
        }
    }

    return value
}

export default parseQueryString