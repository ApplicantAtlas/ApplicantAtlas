import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export type CountdownProps = {
  value: number;
  label: string;
  className?: string;
};

const CountdownItem = ({ num, label }: { num: number; label: string }) => {
  return (
    <div className="font-mono flex flex-col items-center justify-center p-4 bg-primary text-white rounded-lg">
      <div className="w-full text-center relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={num}
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{ ease: 'backIn', duration: 0.75 }}
            className="block text-6xl font-bold"
          >
            {num}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-lg mt-2">{label}</span>
    </div>
  );
};

const Countdown = ({
  value,
  label,
  className,
  ...props
}: CountdownProps): JSX.Element => {
  const classes = twMerge('flex flex-col items-center', className);

  return (
    <div className={classes} {...props}>
      <CountdownItem num={value} label={label} />
    </div>
  );
};

export default Countdown;
