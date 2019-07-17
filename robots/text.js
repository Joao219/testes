const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credencials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content){
    await fetchContentFromWikipedia(content)
    sanitizedContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300")
        const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponde.get()

        content.soucerContentOriginal = wikipediaContent.content
    }

    function sanitizedContent(content){
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.soucerContentOriginal)
        const withoutDatesInParenteses = removeDatesInParenteses(withoutBlankLinesAndMarkdown)
        
        content.soucerContentSanitized = withoutDatesInParenteses

        function removeBlankLinesAndMarkdown(text){
            const allLines = text.split(`\n`)
            const withoutBlankLinesAndMarkdown = allLines.filter( ( line ) => {
                return line.trim().length === 0 || line.trim().startsWith('=') ? false : true
            } )
            
            return withoutBlankLinesAndMarkdown.join(" ")
        }

        function removeDatesInParenteses(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)"\"/gm, '').replace(/  /g,' ')
        }

    }
    
    function breakContentIntoSentences (content){
        content.sentences = []
        const sentence = sentenceBoundaryDetection.sentences(content.soucerContentSanitized)
        sentence.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

}

module.exports = robot