// *********************************************************************
// Homework 4 Public APIs
// *********************************************************************

function formatYearFromStr(dateString) {
  return dateString.split('-')[0];
}

function formatPercentage(value) {
  return `${(value * 100).toFixed(2)}%`;
}

async function load() {

    let gameID = localStorage.getItem("game_id") || "244260";
    let apiKey = localStorage.getItem("api_key");

    if (!apiKey) {
        apiKey = prompt("Enter your GameBrain API key:");

        if (!apiKey) {
            console.error("API key is required.");
            return;
        }

        localStorage.setItem("api_key", apiKey);
    }

    localStorage.setItem("game_id", gameID);

    // Helper function to fetch API data
    async function getJSON(endpoint) {
        const separator = endpoint.includes("?") ? "&" : "?";
        const url =
            `https://api.gamebrain.co${endpoint}${separator}` +
            `api-key=${encodeURIComponent(apiKey)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    }

    try {

        // **************** HERO SECTION ****************

        const game = await getJSON(`/v1/games/${gameID}`);

        document.querySelector("#game-name").textContent =
            game.name || "Unknown game";

        document.querySelector(".game-genre").textContent =
            game.genre || "Genre unavailable";

        document.querySelector(".game-image img").src =
            game.image || game.screenshots?.[0] || "";

        const releaseYear = formatYearFromStr(
            game.release_date || String(game.year || "")
        );

        document.querySelector(".game-meta").textContent =
            `${game.developer || "Unknown developer"} • ${releaseYear}`;


        // **************** GAME NEWS ****************

        const newsResponse = await getJSON(
            `/v1/games/${gameID}/news`
        );

        const newsItems = (newsResponse.news || []).slice(0, 3);
        const newsCards = document.querySelectorAll(".news-card");

        newsCards.forEach((card, index) => {

            const news = newsItems[index];

            if (!news) {
                card.style.display = "none";
                return;
            }

            card.style.display = "";

            card.querySelector("h3").textContent =
                news.title || "Untitled";

            card.querySelector(".news-published").textContent =
                news.published
                    ? `Published ${news.published}`
                    : "Date unavailable";

            const image = card.querySelector("img");

            if (news.image) {
                image.src = news.image;
            }

            image.alt = news.title || "Game news";
        });


        // **************** SIMILAR GAMES ****************

        const genre = game.genre || "role playing";

        const searchResponse = await getJSON(
            `/v1/games?query=${encodeURIComponent(genre)}`
        );

        const candidates = (searchResponse.results || [])
            .filter(item => String(item.id) !== String(gameID))
            .slice(0, 4);

        const similarGames = await Promise.all(
            candidates.map(async candidate => {

                try {
                    const details = await getJSON(
                        `/v1/games/${candidate.id}`
                    );

                    return {
                        ...candidate,
                        ...details,
                        screenshot:
                            details.screenshots?.[0] ||
                            details.image ||
                            candidate.image ||
                            ""
                    };

                } catch (error) {
                    console.error(
                        "Could not load game:",
                        candidate.name,
                        error
                    );

                    return {
                        ...candidate,
                        screenshot: candidate.image || ""
                    };
                }
            })
        );

        const gameCards = document.querySelectorAll(".game-card");

        gameCards.forEach((card, index) => {

            const similar = similarGames[index];

            if (!similar) {
                card.style.display = "none";
                return;
            }

            card.style.display = "";

            card.querySelector("h3").textContent =
                similar.name || "Unknown game";

            const image = card.querySelector("img");

            if (similar.screenshot) {
                image.src = similar.screenshot;
            }

            image.alt = similar.name || "Similar game";

            const metadata =
                card.querySelectorAll(".game-card-meta span");

            // Display the integer part of the year
            metadata[0].textContent =
                Number.isFinite(Number(similar.year))
                    ? String(Math.trunc(Number(similar.year)))
                    : "Year unavailable";

            // Display the rating as a percentage
            const rating = similar.rating?.mean;

            metadata[1].textContent =
                typeof rating === "number"
                    ? formatPercentage(rating)
                    : "Rating unavailable";
        });

    } catch (error) {

        console.error("Unable to load GameBrain data:", error);

        alert(
            "Could not load game data. Check your API key, " +
            "internet connection, and browser console."
        );
    }
}

load();


    




}
load();


   