import { useState } from "react";
import Image from "next/image";
import { Competition } from "@prisma/generated/client";

type CompetitionDropdownProps = {
  competitions: Competition[];
  onSelect: (competition: Competition) => void;
};

export default function CompetitionDropdown({ competitions, onSelect }: CompetitionDropdownProps) {
  const [selected, setSelected] = useState<Competition | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const handleSelect = (comp: Competition) => {
    setSelected(comp);
    setOpen(false);
    onSelect(comp);
  };

  return (
    <div className="relative inline-block w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 text-left bg-white border rounded shadow"
      >
        {selected ? (
          <div className="flex items-center space-x-2">
            <Image src={selected.logoUrl || '/default-image.png'} alt={selected.name} width={24} height={24} />
            <span>{selected.name}</span>
          </div>
        ) : (
          <span>Select competition</span>
        )}
      </button>
      {open && (
        <ul className="absolute z-10 w-full mt-2 bg-white border rounded shadow max-h-60 overflow-auto">
          {competitions.filter((c: Competition) => c.logoUrl).map((comp: Competition) => (
            <li
              key={comp.id}
              onClick={() => handleSelect(comp)}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <Image 
                src={comp.logoUrl || ''} 
                alt={comp.name} 
                width={48} 
                height={48} 
                className="w-[32px] h-fit" 
              />
              <span className="ml-2">{comp.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
