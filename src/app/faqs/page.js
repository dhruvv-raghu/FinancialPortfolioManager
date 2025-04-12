'use client';
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
      {
          question: 'What is this app for?',
          answer: 'This app helps users track their portfolios, including holdings, watchlists, and available funds.'
      },
      {
          question: 'How do I add a stock to my watchlist?',
          answer: 'You can search for a stock on the watchlist page and add it directly to your list.'
      },
      {
        question: 'What is a stock?',
        answer: 'A stock represents a share in the ownership of a company and constitutes a claim on part of the company\'s assets and earnings.'
    },
    {
        question: 'What is a stock dividend?',
        answer: 'A stock dividend is a dividend payment made in the form of additional shares rather than a cash payout.'
    },
    {
        question: 'What is market capitalization?',
        answer: 'Market capitalization (market cap) is the total market value of a company’s outstanding shares of stock.'
    },
    {
        question: 'What are stock options?',
        answer: 'Stock options are contracts that give the holder the right to buy or sell a stock at a specific price before a certain date.'
    },
    {
        question: 'What is a limit order?',
        answer: 'A limit order is an order to buy or sell a stock at a specific price or better.'
    },
   
    {
        question: 'What are ETFs?',
        answer: 'Exchange-Traded Funds (ETFs) are investment funds that trade on stock exchanges, much like stocks.'
    },
    {
        question: 'What is a mutual fund?',
        answer: 'A mutual fund is a professionally managed investment fund that pools money from many investors to purchase securities.'
    },
    {
        question: 'What is dollar-cost averaging?',
        answer: 'Dollar-cost averaging is an investment strategy in which an investor divides the total amount to be invested across periodic purchases to reduce the impact of volatility.'
    },
    {
        question: 'What are penny stocks?',
        answer: 'Penny stocks are low-priced stocks of small companies that trade at less than $5 per share.'
    },
    {
        question: 'What is a blue-chip stock?',
        answer: 'Blue-chip stocks are shares of large, well-established, financially sound companies with a history of reliable performance.'
    },
    {
        question: 'What is an IPO?',
        answer: 'An Initial Public Offering (IPO) is the process by which a private company offers shares to the public in a new stock issuance.'
    },
  ];

  const toggleFAQ = (index) => {
      setOpenIndex(openIndex === index ? null : index);
  };

  return (
      <section className="w-full min-h-screen py-12 md:py-24 lg:py-32" style={{
          background: "linear-gradient(135deg, #001f3f, #000000)", // Blue to black gradient
      }}>
          <div className="container px-4 md:px-6 mx-auto">
              <div className="bg-transparent p-6 rounded-lg shadow-lg">
                  <h2 className="text-3xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
                  {faqs.map((faq, index) => (
                      <div key={index} className="py-4">
                          <div
                              className="flex justify-between items-center cursor-pointer"
                              onClick={() => toggleFAQ(index)}
                          >
                              <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                              <span className={`transform transition-transform text-gray-400 ${openIndex === index ? 'rotate-180' : ''}`}>
                                  ▼
                              </span>
                          </div>
                          {openIndex === index && (
                              <p className="mt-2 text-gray-300">{faq.answer}</p>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </section>
  );
};

export default FAQ;

