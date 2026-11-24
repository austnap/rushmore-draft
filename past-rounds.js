// Your 11 past Mount Rushmore rounds. The host loads these once from Host tools.
// place = finishing spot (1 = winner). Picks are in draft order.
const T = (name, place, picks) => ({ name, place, picks });

export const PAST_ROUNDS = [
  { id: 'r01', createdAt: 1, date: 'Round 1', topic: 'Superheroes', teams: [
    T('Harrison', 1, ['Batman', 'Superman', 'Flash', 'Phoenix']),
    T('Austin', 2, ['Iron Man', 'Thor', 'Dr Strange', 'Wonder Woman']),
    T('Andrew', 3, ['Spider-Man', 'Hulk', 'Captain America', 'Black Panther']),
    T('Nathan', 4, ['Robin Hood', 'Ash Ketchum', 'Elastigirl', 'Geerdos'])] },
  { id: 'r02', createdAt: 2, date: 'Round 2', topic: 'Home Appliances', teams: [
    T('Andrew', 1, ['Stovetop oven', 'Dishwasher', 'Water heater', 'Sink']),
    T('Austin', 2, ['Fridge', 'Washer', 'AC', 'Toaster']),
    T('Harrison', 3, ['Microwave', 'Freezer', 'Dryer', 'Coffee maker']),
    T('Nathan', 4, ['Air fryer', 'Pebble ice', 'Meat grinder', 'Juicer'])] },
  { id: 'r03', createdAt: 3, date: 'Round 3', topic: 'Home Appliances (rescored)', teams: [
    T('Austin', 1, ['Fridge', 'Washer', 'AC', 'Toaster']),
    T('Andrew', 2, ['Stovetop oven', 'Dishwasher', 'Water heater', 'Sink']),
    T('Harrison', 3, ['Microwave', 'Freezer', 'Dryer', 'Coffee maker']),
    T('Nathan', 4, ['Air fryer', 'Pebble ice', 'Meat grinder', 'Juicer'])] },
  { id: 'r04', createdAt: 4, date: 'Round 4', topic: 'Iconic Animals', teams: [
    T('Andrew', 1, ['Dog', 'Tiger', 'Elephant', 'Great white']),
    T('Harrison', 2, ['Horse', 'Cat', 'Blue whale', 'Wolf']),
    T('Austin', 3, ['Lion', 'Cow', 'Orca', 'Fish']),
    T('Nathan', 4, ['Snowshoe hare', 'Meerkat', 'Musk ox', 'Narwhal'])] },
  { id: 'r05', createdAt: 5, date: 'Round 5', topic: 'Sports Teams', teams: [
    T('Austin', 1, ['Lakers', 'Cowboys', 'Alabama', 'Duke']),
    T('Andrew', 2, ['Yankees', 'Patriots', 'Bulls', 'Bruins']),
    T('Harrison', 3, ['Dodgers', 'Celtics', 'Red Sox', 'Chiefs']),
    T('Nathan', 4, ['Indiana Fever', 'Tampa Bay Lightning', 'NMSU Lobos', 'Utah State Aggies'])] },
  { id: 'r06', createdAt: 6, date: 'Round 6', topic: 'Historical Events', teams: [
    T('Andrew', 1, ['Hiroshima/Nagasaki', 'Crucifixion', 'Fall of Rome', 'Locomotive']),
    T('Austin', 2, ['Holocaust', 'Franz Ferdinand', 'Declaration of Independence', 'Internet']),
    T('Harrison', 3, ['9/11', 'Printing Press', 'Bolshevik Revolution', 'Black Death']),
    T('Nathan', 4, ['Sandy Hook', 'Joseph Smith tarring', 'Boston Marathon', 'Winter War'])] },
  { id: 'r07', createdAt: 7, date: 'Round 7', topic: 'Movies', teams: [
    T('Harrison', 1, ['Godfather', 'Passion of the Christ', 'Snow White', 'Citizen Kane']),
    T('Andrew', 2, ['2001', 'Dark Knight', 'Avatar', 'The Prestige']),
    T('Austin', 3, ['A New Hope', 'Fight Club', '12 Angry Men', 'Toy Story']),
    T('Justin', 4, ['Lord of the Rings', 'Titanic', 'Forrest Gump', 'Inception']),
    T('Nathan', 5, ['The Notebook', 'Moneyball', 'Soul Surfer', 'Transformers'])] },
  { id: 'r08', createdAt: 8, date: 'Round 8', topic: 'Athletes', teams: [
    T('Nathan', 1, ['Tom Brady', 'Michael Phelps', 'Kobe', 'Barry Bonds']),
    T('Harrison', 2, ['Maradona', 'Ronaldo', 'Usain Bolt', 'Serena']),
    T('Andrew', 3, ['Messi', 'LeBron', 'Gretzky', 'Ted Williams']),
    T('Austin', 4, ['Tiger Woods', 'Babe Ruth', 'Kipchoge', 'Pelé']),
    T('Braxton', 5, ['Michael Jordan', 'Jack Nicklaus', 'Simone Biles', 'Peyton Manning'])] },
  { id: 'r09', createdAt: 9, date: 'Round 9', topic: 'Musicians', teams: [
    T('Justin', 1, ['Michael Jackson', 'Whitney', 'Johnny Cash', 'Eminem']),
    T('Nathan', 2, ['The Beatles', 'The Weeknd', 'Garth Brooks', 'Bad Bunny']),
    T('Braxton', 3, ['Elvis', 'Beyoncé', 'Coldplay', 'Luke Combs']),
    T('Austin', 4, ['Queen', 'KISS', 'Shakira', 'Jay-Z']),
    T('Andrew', 5, ['Taylor Swift', 'Drake', 'Backstreet Boys', 'AC/DC']),
    T('Harrison', 6, ['Justin Bieber', 'Madonna', 'George Strait', 'Rolling Stones'])] },
  { id: 'r10', createdAt: 10, date: 'Round 10', topic: 'Villains', teams: [
    T('Justin', 1, ['Joker', 'Voldemort', 'Saddam', 'Capone']),
    T('Austin', 2, ['Satan', 'Green Goblin', 'Hannibal Lecter', 'Ted Bundy']),
    T('Braxton', 3, ['Hitler', 'Ivan Drago', 'Michael Myers', 'Norman Bates']),
    T('Andrew', 4, ['Bowser', 'bin Laden', 'Jason', 'Bane']),
    T('Nathan', 5, ['Darth Vader', 'El Mencho', 'Grinch', 'Escobar']),
    T('Harrison', 6, ['Thanos', 'Sauron', 'DoodleBob', 'Boogeyman'])] },
  { id: 'r11', createdAt: 11, date: 'Round 11', topic: 'Brands', teams: [
    T('Justin', 1, ["McDonald's", 'Disney', 'Rolex', 'Louis Vuitton']),
    T('Braxton', 2, ['Nike', 'Amazon', 'Visa', 'Microsoft']),
    T('Andrew', 3, ['Google', 'Jordan', 'Lululemon', 'Ferrari']),
    T('Austin', 4, ['Adidas', 'Walmart', 'Procter & Gamble', 'Nvidia']),
    T('Nathan', 5, ['Apple', 'Ford', 'Toyota', 'Delta']),
    T('Harrison', 6, ['Coca-Cola', 'Fiat', 'Universal', 'Champion'])] }
];
