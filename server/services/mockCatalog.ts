import { Product } from "@shared/schema";
import { BuyLinkService } from './buyLinkService.js';

export const mockPartsCatalog: Product[] = [
  // PS11752778 - REFRIGERATOR Door Shelf Bin (not dishwasher!)
  {
    partNumber: "PS11752778",
    name: "Refrigerator Door Shelf Bin",
    price: "$45.07",
    imageUrl: "", // Will be populated dynamically with SVG or verified PartSelect images
    compatibility: ["WRF535SWHZ00", "WRS325SDHZ00", "WRF767SDHZ00", "ED5FHAXVB02"],
    category: "refrigerator",
    buyLink: "https://www.partselect.com/PS11752778-Whirlpool-WPW10321304-Refrigerator-Door-Bin.htm"
  },
  // WDT780SAEM1 Compatible Dishwasher Pump 
  {
    partNumber: "PS11756692",
    name: "Dishwasher Pump and Motor Assembly",
    price: "$164.95",
    imageUrl: "", // Will be populated dynamically with SVG or verified PartSelect images
    compatibility: ["WDT780SAEM1", "WDT730PAHZ0", "KDTM704KPS0", "WDF520PADM7"],
    category: "dishwasher",
    buyLink: "https://www.partselect.com/PS11756692-Whirlpool-W10348269-Dishwasher-Drain-Pump.htm"
  },
  // Whirlpool Ice Maker Assembly - Multiple Model Compatible
  {
    partNumber: "PS12584610",
    name: "Ice Maker Assembly",
    price: "$100.79",
    imageUrl: "", // Will be populated dynamically with SVG or verified PartSelect images
    compatibility: ["WRS325SDHZ01", "WRS325SDHZ05", "WRS325SDHZ08", "WRF535SWHZ04"],
    category: "refrigerator",
    buyLink: "https://www.partselect.com/PS12584610-Ice-Maker-Assembly.htm"
  },
  {
    partNumber: "PS733947",
    name: "Refrigerator Ice Maker Motor Kit",
    price: "$78.50",
    imageUrl: "", // Will be populated dynamically with SVG or verified PartSelect images
    compatibility: ["ED5FHAXVB02", "KSCS25FTSS02", "WRF535SWHZ00", "GI15NDXZS4"],
    category: "refrigerator",
    buyLink: "https://www.partselect.com/"
  },
  {
    partNumber: "PS260801",
    name: "Dishwasher Motor and Pump Kit",
    price: "$198.75",
    imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUY1RjUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyMCIgZmlsbD0iIzk0QTNBOCIvPjx0ZXh0IHg9IjUwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QdW1wPC90ZXh0Pjwvc3ZnPg==",
    compatibility: ["GDT695SSJSS", "HDA3600G06WW", "KDTE334GPS0", "KDPM354GPS0"],
    category: "dishwasher",
    buyLink: "https://www.partselect.com/"
  },
  {
    partNumber: "PS2179605",
    name: "Refrigerator Water Filter EDR1RXD1",
    price: "$49.99",
    imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUY1RjUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyMCIgZmlsbD0iIzk0QTNBOCIvPjx0ZXh0IHg9IjUwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GaWx0ZXI8L3RleHQ+PC9zdmc+",
    compatibility: ["WRF535SWHZ00", "WRS325SDHZ00", "GI15NDXZS4", "WRF767SDHZ00"],
    category: "refrigerator",
    buyLink: "https://www.partselect.com/"
  },
  {
    partNumber: "PS356593",
    name: "Dishwasher Lower Door Seal Kit",
    price: "$23.45",
    imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMjAgNDBRNTAgMjAgODAgNDBRNTAgNjAgMjAgNDAiIGZpbGw9IiM5NEEzQTgiLz48dGV4dCB4PSI1MCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2VhbDwvdGV4dD48L3N2Zz4=",
    compatibility: ["KDTM354DSS0", "KDTE334GPS0", "WDF520PADM7", "KDFM404KPS0"],
    category: "dishwasher",
    buyLink: "https://www.partselect.com/"
  },
  {
    partNumber: "PS2355119",
    name: "Refrigerator Evaporator Fan Motor",
    price: "$78.50",
    imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUY1RjUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyMCIgZmlsbD0iIzk0QTNBOCIvPjxwYXRoIGQ9Ik00MCA0MEw2MCA2ME00MCA2MEw2MCA0MCIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RmFuIE1vdG9yPC90ZXh0Pjwvc3ZnPg==",
    compatibility: ["WRS588FIHZ00", "WRF535SWHZ00", "GI15NDXZS4", "WRS325SDHZ00"],
    category: "refrigerator",
    buyLink: "https://www.partselect.com/"
  },
  {
    partNumber: "PS9495545",
    name: "Dishwasher Bottom Door Gasket",
    price: "$19.75",
    imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMjAgNDBRNTAgMjAgODAgNDBRNTAgNjAgMjAgNDAiIGZpbGw9IiM5NEEzQTgiLz48dGV4dCB4PSI1MCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R2Fza2V0PC90ZXh0Pjwvc3ZnPg==",
    compatibility: ["FFBD2412SS0A", "FFID2426TS4A", "FDBB2112TX1A", "FFBD2411NW3A"],
    category: "dishwasher",
    buyLink: "https://www.partselect.com/"
  },
  {
    partNumber: "PS2071928",
    name: "Refrigerator Defrost Heater",
    price: "$42.99",
    imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMjAgNTBRNDAgMzAgNjAgNTBRODAgNzAgNjAgNTBRNDAgMzAgMjAgNTAiIHN0cm9rZT0iIzk0QTNBOCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+PHRleHQgeD0iNTAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhlYXRlcjwvdGV4dD48L3N2Zz4=",
    compatibility: ["WRF767SDHZ00", "WRS588FIHZ00", "WRS325SDHZ00", "GI15NDXZS4"],
    category: "refrigerator",
    buyLink: "https://www.partselect.com/"
  },
  // WDT780SAEM1 Compatible Drain Hose
  {
    partNumber: "PS11746240",
    name: "Dishwasher Drain Hose",
    price: "$31.75",
    imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMjAgNDBRNDAgMjAgNjAgNDBRODAgNjAgNjAgODBRNDAgMTAwIDIwIDgwIiBzdHJva2U9IiM5NEEzQTgiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIvPjx0ZXh0IHg9IjUwIiB5PSI5MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EcmFpbiBIb3NlPC90ZXh0Pjwvc3ZnPg==",
    compatibility: ["WDT780SAEM1", "KDTE334GPS0", "KDPM354GPS0", "WDT750SAHZ0"],
    category: "dishwasher",
    buyLink: "https://www.partselect.com/"
  },
  {
    partNumber: "PS2163382",
    name: "Refrigerator Door Gasket",
    price: "$95.80",
    imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMjAgNDBRNTAgMjAgODAgNDBRNTAgNjAgMjAgNDAiIGZpbGw9IiM5NEEzQTgiLz48dGV4dCB4PSI1MCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R2Fza2V0PC90ZXh0Pjwvc3ZnPg==",
    compatibility: ["WRF535SWHZ00", "WRF767SDHZ00", "WRS588FIHZ00", "WRS325SDHZ00"],
    category: "refrigerator",
    buyLink: "https://www.partselect.com/"
  },
  {
    partNumber: "PS11753379",
    name: "Dishwasher Drain Pump 120V 60Hz",
    price: "$59.95",
    imageUrl: "https://images.thdstatic.com/productImages/726726fb-7066-4832-8043-1ab0c0c85c9a/svn/whirlpool-dishwasher-parts-wpw10348269-64_600.jpg",
    compatibility: ["WDT780SAEM1", "KDTE334GPS0", "WDF520PADM7", "KDPM354GPS0"],
    category: "dishwasher",
    buyLink: "https://www.partselect.com/PS11753379-Dishwasher-Drain-Pump.htm"
  }
];

export function searchMockCatalog(query: string): Product[] {
  const searchTerms = query.toLowerCase().split(' ');
  
  return mockPartsCatalog.filter(product => {
    const searchableText = [
      product.name,
      product.partNumber,
      product.category,
      ...product.compatibility
    ].join(' ').toLowerCase();
    
    return searchTerms.some(term => searchableText.includes(term));
  });
}

export function findPartByNumber(partNumber: string): Product | undefined {
  return mockPartsCatalog.find(product => 
    product.partNumber.toLowerCase() === partNumber.toLowerCase()
  );
}

export function findCompatibleParts(modelNumber: string): Product[] {
  return mockPartsCatalog.filter(product =>
    product.compatibility.some(model => 
      model.toLowerCase().includes(modelNumber.toLowerCase())
    )
  );
}
