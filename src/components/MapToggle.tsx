import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Map, List, X } from 'lucide-react';

interface MapToggleProps {
  showMap: boolean;
  onToggle: (show: boolean) => void;
  mapComponent: React.ReactNode;
  listComponent: React.ReactNode;
}

export function MapToggle({ showMap, onToggle, mapComponent, listComponent }: MapToggleProps) {
  return (
    <div className="relative">
      {/* Toggle Button - Mobile */}
      <div className="md:hidden mb-4">
        <Button
          onClick={() => onToggle(!showMap)}
          variant="outline"
          className="w-full"
        >
          {showMap ? (
            <>
              <List className="w-4 h-4 mr-2" />
              Show List View
            </>
          ) : (
            <>
              <Map className="w-4 h-4 mr-2" />
              Show Map View
            </>
          )}
        </Button>
      </div>

      {/* Desktop: Side by side */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-6">
        <div>{mapComponent}</div>
        <div>{listComponent}</div>
      </div>

      {/* Mobile: Toggle view */}
      <div className="md:hidden">
        <AnimatePresence mode="wait">
          {showMap ? (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {mapComponent}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {listComponent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}