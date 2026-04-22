/* ============================================
   Rico's Menu — Chapter Data
   All 8 chapters with their full menu content
   ============================================ */

export const chapters = [
  // ──────────────────────────────────────────
  // CHAPTER I — ALL DAY BRUNCH
  // ──────────────────────────────────────────
  {
    id: 'brunch',
    roman: 'I',
    label: 'Chapter One',
    title: 'All Day Brunch',
    desc: 'Stacks · The Big Ones · Egg Situation · On Toast',
    illustration: '/images/brunch_illus.png',
    chapterImage: '/images/brunch_chapter.png',
    subcategories: [
      {
        name: 'Pancake Stacks — Stack of 3',
        layout: 'list',
        items: [
          { name: 'Cloud Nine French Toast', desc: 'Brown butter, whipped classic Crème Anglaise, yuzu curd &amp; honeycomb crumble', badge: 'veg' },
          { name: 'Miso Caramel Banana Stack', desc: 'Japanese miso caramel, fresh banana, sesame brittle &amp; toasted coconut cream', badge: 'veg' },
          { name: 'Dark Matter Chocolate Stack', desc: '55% Van Houten dark chocolate pancake, ganache drip, sesame praline &amp; sour cherry', badge: 'veg' },
        ],
      },
      {
        name: 'The Big Ones',
        layout: 'list',
        items: [
          { name: 'The Full Rico\'s', desc: 'Smoked chicken, Frank Furter, hashbrown, slow-roast tomatoes, miso butter mushrooms, fried egg, sourdough toast &amp; a beverage of your choice', badge: 'nonveg' },
          { name: 'Garden Party Brekkie', desc: 'Harissa baked beans, za\'atar roast tomatoes, whipped sour cream, avocado, hashbrown &amp; sourdough &amp; a beverage of your choice', badge: 'veg' },
        ],
      },
      {
        name: 'Egg Situation — All Served with Toasted Sourdough &amp; Cultured Butter',
        layout: 'list',
        items: [
          { name: 'Shakshuka Verde', desc: 'Tomatillo shakshuka, poached eggs, fresh baby spinach, olives &amp; crispy chickpeas', badge: 'veg' },
          { name: 'Three-Cheese Fluffed', desc: 'Aged cheddar, gruyère &amp; mozzarella folded omelette, truffle oil to finish', badge: 'veg' },
          { name: 'Spiced Masala Scramble', desc: 'Desi-spiced scrambled eggs, green chilli, coriander, onion served on toast', badge: 'veg' },
        ],
      },
      {
        name: 'On Toast',
        layout: 'grid',
        items: [
          { name: 'Smashed Avo &amp; Burrata Toast', desc: 'Cold-pressed avo smash, fresh burrata, confit cherry tomatoes, micro herbs &amp; paprika', badge: 'veg' },
          { name: 'Turkish Cloud Eggs', desc: 'Whipped labneh, slow-poached eggs, brown butter, Aleppo chilli oil &amp; za\'atar dust', badge: 'veg' },
          { name: 'Whipped Ricotta &amp; \'Nduja Chicken Toast', desc: 'House whipped ricotta, spicy chicken, pickled honey dressing &amp; pumpkin seeds', badge: 'nonveg' },
          { name: 'Smoked Chicken &amp; Avocado Toast', desc: 'Mango wood smoked chicken, avocado purée, cucumber ribbons, yuzu mayo &amp; sesame dust', badge: 'nonveg' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // CHAPTER II — SMALL PLATES & SNACKS
  // ──────────────────────────────────────────
  {
    id: 'smallplates',
    roman: 'II',
    label: 'Chapter Two',
    title: 'Small Plates & Snacks',
    desc: 'Veggie · Get Meaty · Sides &amp; Sharing',
    illustration: '/images/smallplates_illus.png',
    chapterImage: '/images/smallplates_chapter.png',
    subcategories: [
      {
        name: 'Veggie',
        layout: 'list',
        gridGroup: 'a',
        items: [
          { name: 'Whipped Feta Stuffed Mushrooms', desc: 'Button mushrooms, whipped feta, roasted peppers, herb panko crust &amp; spicy honey mayo', badge: 'veg' },
          { name: 'Jalapeño Cream Cheese Poppers', desc: 'House-made cream cheese &amp; jalapeño filling, panko crust, yuzu tartare', badge: 'veg' },
          { name: 'Stretchy Pesto Cheese Sticks', desc: 'Mozzarella sticks marinated in pesto, panko-crusted, served with arrabiata dip', badge: 'veg' },
          { name: 'Smoked Paneer Bao Buns', desc: 'Sticky hoisin smoked paneer, pickled daikon, Togarashi mayo, spring onion', badge: 'veg' },
          { name: 'Louisiana Crunch Rolls', desc: 'Spiced cottage cheese &amp; roasted corn, five-spice powder, gochujang dipping sauce', badge: 'veg' },
        ],
      },
      {
        name: 'Get Meaty',
        layout: 'list',
        gridGroup: 'a',
        items: [
          { name: 'Zinger Chicken Strips', desc: 'Korean-spiced fried chicken tenders, gochujang glaze &amp; ranch', badge: 'nonveg' },
          { name: 'Sticky BBQ Chicken Skewers', desc: 'Chargrilled chicken thighs, house chipotle-honey BBQ &amp; Parmesan dip', badge: 'nonveg' },
          { name: 'Crispy Garlic Shrimp', desc: 'Wok-fried prawns, XO butter, toasted garlic &amp; lemon zest', badge: 'nonveg' },
          { name: 'Panko Fish Fingers', desc: 'Sustainably sourced river sole, Togarashi panko crust, yuzu tartare', badge: 'nonveg' },
          { name: 'Sloppy Joe Crispy Rolls', desc: 'Slow-braised chicken mince, chipotle BBQ, spring onion, crispy wonton skin', badge: 'nonveg' },
        ],
      },
      {
        name: 'Sides &amp; Sharing',
        layout: 'grid',
        items: [
          { name: 'Rossa Hummus &amp; Warm Pita', desc: 'Smoky roasted red pepper hummus, za\'atar oil, labneh &amp; pita chips', badge: 'veg' },
          { name: 'V Fries', desc: 'Crispy fries, spiced cottage cheese &amp; chipotle beans or crispy chicken, three ways — with smoke &amp; garlic mayo', badge: 'both' },
          { name: 'Truffle Fries', desc: 'Thin-cut fries, black truffle mayo, parmesan snow &amp; chives', badge: 'veg' },
          { name: 'Dirty Loaded Nachos', desc: 'Tortilla chips, pepper jack queso, pico de gallo, jalapeños, sour cream &amp; guac', badge: 'both' },
          { name: 'Garlic Sourdough', desc: 'Handmade fresh sourdough, cultured garlic butter or peri-peri chilli oil — Classic or Peri-Peri', badge: 'veg' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // CHAPTER III — SMASH BURGERS
  // ──────────────────────────────────────────
  {
    id: 'burgers',
    roman: 'III',
    label: 'Chapter Three',
    title: 'Smash Burgers',
    desc: 'Double Smash-Pressed · Served in a Brioche Bun',
    illustration: '/images/burgers_illus.png',
    chapterImage: '/images/burgers_chapter.png',
    subcategories: [
      {
        name: 'Veggie',
        layout: 'cards',
        items: [
          { label: 'The Shoreditch', name: 'Veggie Burger', desc: 'Five-veg smash patty, crispy fried shallots, smoked tomato relish, house pickles &amp; chipotle mayo', badge: 'veg' },
          { label: 'West Coast', name: 'Guac Burger', desc: 'Corn &amp; paprika smash patty, fresh guacamole, crispy onion rings, pico de gallo', badge: 'veg' },
          { label: 'The Paneer', name: 'Bhuna Smash', desc: 'Tandoori spiced paneer patty, mango chutney, cucumber raita, rocket', badge: 'veg' },
          { label: 'Slider Board', name: 'Mini Me Veg Sliders', desc: 'Three mini smash burgers — Shoreditch Veggie · West Coast Guac · Paneer Bhuna', badge: 'slider' },
        ],
      },
      {
        name: 'Meaty',
        layout: 'cards',
        items: [
          { label: 'The Nashville', name: 'Hot Chicken Burger', desc: 'Double smash chicken patty, house Nashville hot sauce, pickles, slaw &amp; honey mustard', badge: 'nonveg' },
          { label: 'The DIFC', name: 'Fried Chicken Burger', desc: 'Crispy buttermilk fried chicken, spicy mayo, caramelised onions, cheese sauce &amp; pickled jalapeño', badge: 'nonveg' },
          { label: 'The Turkish', name: 'Lamb Burger', desc: 'Hand minced lamb, red onions, pepper, paprika, spicy mayo &amp; cheese sauce', badge: 'nonveg' },
          { label: 'Slider Board', name: 'Mini Me Non-Veg Sliders', desc: 'Three mini smash burgers — Nashville Hot · DIFC Fried Chicken · Turkish Lamb', badge: 'slider' },
        ],
      },
      {
        name: 'Open Toasts &amp; Croissant — Perfect for Any Hour',
        layout: 'grid',
        items: [
          { name: 'The Mayfair Mushroom Melt', desc: 'Truffle-roasted mix mushrooms, Gruyère, cream cheese, walnut pesto with chili onion jam on bread', badge: 'veg' },
          { name: 'Smashed Avo Club', desc: 'Avo smash, pickled cucumber, red cabbage coleslaw, aged cheddar &amp; lemon oil — double stacked on bread', badge: 'veg' },
          { name: 'The Shoreditch Club Wrap', desc: 'Slow-roast chicken, Frank Furter, aged cheddar, avocado, sun-dried tomato aioli in toasted bread', badge: 'nonveg' },
          { name: 'Spiced Chicken Toast', desc: 'Tikka-spiced chicken, house hummus, pickled red onion, mint yoghurt on warm bread', badge: 'nonveg' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // CHAPTER IV — LATIN STREET FIESTA
  // ──────────────────────────────────────────
  {
    id: 'fiesta',
    roman: 'IV',
    label: 'Chapter Four',
    title: 'Latin Street — Fiesta',
    desc: 'Pick Your Format · Pick Your Filling · Served with House Salsa &amp; Crema',
    illustration: '/images/fiesta_illus.png',
    chapterImage: '/images/fiesta_chapter.png',
    specialLayout: 'fiesta',
    subcategories: [
      {
        name: 'Formats',
        layout: 'fiesta',
        items: [
          { name: 'Tacos (Soft / Crispy)', desc: 'Cooked on slow heat, served with rich consommé for dipping' },
          { name: 'Burrito Roll', desc: 'Flour tortilla, cilantro rice, black beans, pico de gallo, sour cream' },
          { name: 'Baked Cheese Enchiladas', desc: 'Flour tortillas, pepper jack queso, tomatillo &amp; chipotle sauce, baked crisp' },
          { name: 'Quesadillas', desc: 'Pressed flour tortilla, three-cheese blend, caramelised onions, charred corn' },
          { name: 'Burrito Bowl', desc: 'Cilantro-lime rice, black beans, roasted corn, tortilla chips, house guac &amp; filling', fullWidth: true },
        ],
      },
      {
        name: 'Fillings',
        layout: 'chips',
        items: [
          { name: 'Roasted Bell Pepper &amp; Black Bean', badge: 'veg' },
          { name: 'Gochujang Paneer', badge: 'veg' },
          { name: 'Gochujang Pulled Chicken', badge: 'nonveg' },
          { name: 'Chicken &amp; Smoked Cheddar', badge: 'nonveg' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // CHAPTER V — PASTA
  // ──────────────────────────────────────────
  {
    id: 'pasta',
    roman: 'V',
    label: 'Chapter Five',
    title: 'Pasta',
    desc: 'Choose Your Shape — Penne Rigate or Spaghetti',
    illustration: '/images/pasta_illus.png',
    chapterImage: '/images/pasta_chapter.png',
    subcategories: [
      {
        name: null, // no subcategory header — single grid
        layout: 'grid',
        items: [
          { name: 'Truffled White Velvet Alfredo', desc: 'Brown butter, aged parmesan, black truffle oil, toasted granulate', badge: 'veg' },
          { name: 'Rose Peri-Peri Pasta', desc: 'Smoky rose tomatoes, roasted pepper cream, pickled lemon', badge: 'veg' },
          { name: 'Smoked Mac &amp; Cheese Bake', desc: 'Four cheese mornay, panko breadcrumb crust, smoked paprika oil — straight from the oven', badge: 'veg' },
          { name: 'Homemade Ricotta Ravioli', desc: 'Fresh ricotta &amp; herb filling, sage-brown butter, spiced cranberry', badge: 'veg' },
          { name: '\'Nduja Arrabbiata', desc: 'Roma tomato, \'nduja oil, castelvetrano olives, parmigiano', badge: 'nonveg' },
          { name: 'Slow Bolognese — Two Ways', desc: '12-hour braised ragù — Soya mince or Chicken — house red wine, Grana Padano — Choose your protein', badge: 'both' },
          { name: 'Signature Baked Lasagne', desc: 'Slow-cooked ragù (Veg or Chicken), béchamel, parmigiano, torn mozzarella — baked to order', badge: 'both' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // CHAPTER VI — PIZZA
  // ──────────────────────────────────────────
  {
    id: 'pizza',
    roman: 'VI',
    label: 'Chapter Six',
    title: 'Pizza',
    desc: '',
    illustration: '/images/pizza_illus.png',
    chapterImage: '/images/pizza_chapter.png',
    specialLayout: 'pizza',
    pizzaBadge: ['13 Inch · 48-Hour Cold-Proved', 'Neapolitan Base · Wood-Fired Finish'],
    subcategories: [
      {
        name: 'Veggie',
        layout: 'grid',
        items: [
          { name: 'Tikka Paneer Diavola', desc: 'Roma tomato base, tandoori paneer, smoked peppers, green chilli, fresh coriander', badge: 'veg' },
          { name: 'Burrata &amp; Slow-Roast Tomato', desc: 'Cherry tomato confit, torn fresh burrata, sun-dried tomato tapenade, basil oil', badge: 'veg' },
          { name: 'Wild Mushroom &amp; Truffle', desc: 'Porcini cream, mixed wild mushrooms, thyme, soft camembert, truffle honey', badge: 'veg' },
          { name: 'Green Goddess', desc: 'Asparagus cream, edamame, charred courgette, buffalo mozzarella, pepitas', badge: 'veg' },
          { name: 'Smoked Ricotta &amp; Calabrian Chilli', desc: 'Whipped smoked ricotta, Calabrian chilli honey, bell pepper, caramelised onion, rocket', badge: 'veg' },
        ],
      },
      {
        name: 'Meaty',
        layout: 'grid',
        items: [
          { name: 'Pesto Chicken &amp; Burrata', desc: 'Pistachio pesto base, pulled pesto chicken, fresh burrata, asparagus, chilli, olives', badge: 'nonveg' },
          { name: 'The Ridgeback (Ultimate Chicken)', desc: 'Tomato base, confit chicken, spiced chicken sausage, Jamaican jerk oil, mozzarella', badge: 'nonveg' },
          { name: 'Honey Hot Chicken', desc: 'Peri-peri base, crispy chicken, honey-glazed jalapeños, braised red onion, olives', badge: 'nonveg' },
          { name: 'The Pepperoni Cloud', desc: 'Aged mozzarella cups, cupped 100% pork pepperoni, hot honey finish', badge: 'nonveg' },
          { name: 'Vodka Poached Seafood', desc: 'Vodka-mascarpone cream, butter-poached mixed seafood, dill oil, white truffle', badge: 'nonveg' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // CHAPTER VII — MAINS
  // ──────────────────────────────────────────
  {
    id: 'mains',
    roman: 'VII',
    label: 'Chapter Seven',
    title: 'Mains',
    desc: 'Veggie · Meaty · Sizzlers',
    illustration: '/images/mains_illus.png',
    chapterImage: '/images/mains_chapter.png',
    subcategories: [
      {
        name: 'Veggie',
        layout: 'list',
        gridGroup: 'a',
        items: [
          { name: 'Mezze Platter — Garden Style', desc: 'Whipped labneh, charred flatbread, roasted pepper hummus, smoked aubergine, pickled veg &amp; Fattoush', badge: 'veg' },
          { name: 'Sizzling Paneer Steak', desc: 'Chargrilled 200g paneer steak, truffle mushroom jus, pomme purée, roasted carrots &amp; sourdough', badge: 'sizzler' },
          { name: 'Mushroom Porcini Stroganoff', desc: 'Porcini &amp; button mushrooms in a smoky cream sauce, house pickles, saffron rice', badge: 'veg' },
          { name: 'Mexican Grilled Paneer', desc: 'Mexican-spiced paneer, ancho chilli salsa, tossed corn, cilantro rice', badge: 'veg' },
        ],
      },
      {
        name: 'Meaty',
        layout: 'list',
        gridGroup: 'a',
        items: [
          { name: 'Crispy Fish &amp; Fat Chips', desc: 'Beer-battered sustainably sourced fish, chunky chips, tossed edamame, dill tartare &amp; malt vinegar', badge: 'nonveg' },
          { name: 'Chicken Shawarma Board', desc: 'Slow grilled chicken, house-made pita, burnt garlic hummus, labneh, pickles &amp; sumac onions', badge: 'nonveg' },
          { name: 'Grilled Peri-Peri Chicken', desc: 'Butterfly chicken, signature peri-peri marinade, lemon-herb rice, charred sweetcorn', badge: 'nonveg' },
          { name: 'Sizzling Chicken Steak', desc: 'Herb-brined chicken breast, mushroom-truffle jus, pomme purée, veggies &amp; broccoli, garlic bread', badge: 'sizzler' },
          { name: 'Seafood Sizzler', desc: 'Seared river sole &amp; prawns, lemon-caper beurre blanc, roast potatoes, wilted greens, garlic bread', badge: 'sizzler' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────
  // CHAPTER VIII — SUNDAES & SWEETS
  // ──────────────────────────────────────────
  {
    id: 'sundaes',
    roman: 'VIII',
    label: 'Chapter Eight',
    title: 'Sundaes & Sweets',
    desc: 'Soft Serve · Sundaes · Something to Regret Not Ordering',
    illustration: '/images/sundaes_illus.png',
    chapterImage: '/images/sundaes_chapter.png',
    subcategories: [
      {
        name: null,
        layout: 'cards',
        items: [
          { name: 'The Dubai Chocolate Sundae', desc: 'Pistachio &amp; nut ice cream, Kataifi pastry crunch, dark chocolate drip, rose cream' },
          { name: 'Tropical Mango Tower', desc: 'Alphonso mango ice cream, coconut ice cream, lychee pearls, passion fruit sauce' },
          { name: 'Death by Chocolate 2.0', desc: 'Van Houten soft serve chocolate ice cream, warm brownie, caramel fudge sauce, 55% dark chocolate truffle' },
          { name: 'Salted Caramel Fudge Sundae', desc: 'Vanilla bean soft serve, house salted caramel, honeycomb crumbs, whipped cream — the one you\'ll regret not ordering' },
        ],
      },
    ],
  },
];

/**
 * Get a chapter by its id (slug)
 */
export function getChapter(id) {
  return chapters.find(c => c.id === id) || null;
}

/**
 * Get the next chapter after the given id
 */
export function getNextChapter(id) {
  const idx = chapters.findIndex(c => c.id === id);
  return idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null;
}

/**
 * Get the previous chapter before the given id
 */
export function getPrevChapter(id) {
  const idx = chapters.findIndex(c => c.id === id);
  return idx > 0 ? chapters[idx - 1] : null;
}

/**
 * Get chapter index (0-based)
 */
export function getChapterIndex(id) {
  return chapters.findIndex(c => c.id === id);
}
