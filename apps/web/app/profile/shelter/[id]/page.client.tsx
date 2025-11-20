"use client";

import { Star, TrendingUp, DollarSign, Facebook, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ShelterProfilePageClient({ shelter }: { shelter: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const transactionsPerPage = 5;
  const [mobileTab, setMobileTab] = useState("dogs");
  const router = useRouter();

  useEffect(() => {
    if (shelter.currentCauses.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % shelter.currentCauses.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [shelter.currentCauses.length]);

  const paginatedTransactions = shelter.transactions.slice(
    currentPage * transactionsPerPage,
    (currentPage + 1) * transactionsPerPage
  );
  const totalPages = Math.ceil(shelter.transactions.length / transactionsPerPage);

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + shelter.currentCauses.length) % shelter.currentCauses.length
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="font-sans text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
              {shelter.organizationName}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.floor(shelter.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : star - 0.5 <= shelter.rating
                          ? "fill-yellow-400/50 text-yellow-400"
                          : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-base font-semibold text-gray-900">
                {shelter.rating.toFixed(1)}
              </span>
            </div>
            <div className="flex gap-2">
              {shelter.socialMedia.facebook && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Facebook className="h-4 w-4" />
                </div>
              )}
              {shelter.socialMedia.instagram && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                  <Instagram className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 md:text-base">
            {shelter.location || "Location not specified"}
          </p>
        </div>

        <div className="mb-8 mx-auto max-w-4xl">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={shelter.profilePhoto || "/placeholder.svg"}
                alt={shelter.organizationName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-start rounded-lg border-2 border-purple-300 bg-gradient-to-br from-purple-100 via-purple-50 to-white p-6 shadow-sm">
              <p className="text-base leading-relaxed text-gray-900 font-medium">
                {shelter.description}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <Tabs defaultValue="dogs" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="dogs">Dogs</TabsTrigger>
              <TabsTrigger value="financial">Financial Overview</TabsTrigger>
              <TabsTrigger value="updates">Latest Updates</TabsTrigger>
            </TabsList>

            {/* Dogs Tab */}
            <TabsContent value="dogs">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shelter.currentCauses.map((cause: any) => (
                  <div
                    key={cause.dogId}
                    onClick={() => router.push(`/donate/${cause.dogId}`)}
                    className="group rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm hover:shadow-md transition-all hover:border-purple-400 cursor-pointer"
                  >
                    <img
                      src={cause.dogImage || "/placeholder.svg"}
                      alt={cause.dogName}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-sans text-lg font-bold text-gray-900 mb-2">
                      {cause.dogName}
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Help {cause.dogName} find their forever home
                    </p>
                    <button className="w-full rounded-lg bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-purple-900 px-4 py-2 text-sm font-semibold hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-300 transition-all pointer-events-none">
                      Donate Now
                    </button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Financial Overview Tab */}
            <TabsContent value="financial">
              <div className="rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Received</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${shelter.totalReceived.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-orange-600">
                          ${shelter.totalSpent.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="mb-4 font-sans text-lg font-semibold text-gray-800">
                  Recent Transactions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Details
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedTransactions.map((tx: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">{tx.date}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                                tx.type === "donation"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {tx.type === "donation" ? "Donation" : "Expense"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {tx.type === "donation" ? (
                              <div>
                                <div>{tx.crypto}</div>
                                <div className="text-xs text-gray-500">From: {tx.donor}</div>
                              </div>
                            ) : (
                              <div>{tx.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`font-semibold ${tx.type === "donation" ? "text-green-600" : "text-orange-600"}`}
                            >
                              {tx.type === "donation" ? "+" : "-"}${tx.amount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Latest Updates Tab */}
            <TabsContent value="updates">
              <div className="space-y-4">
                {shelter.latestUpdates.map((update: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm hover:shadow-md transition-all hover:border-purple-400"
                  >
                    <div className="flex gap-4">
                      <img
                        src={update.dogImage || "/placeholder.svg"}
                        alt={update.dogName}
                        className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="font-sans font-bold text-gray-900 text-lg mb-1">
                          {update.dogName}
                        </h4>
                        <span className="text-xs text-gray-600 mb-2 block">{update.date}</span>
                        <p className="text-sm leading-relaxed text-gray-700">{update.update}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:hidden mb-6">
          <Select value={mobileTab} onValueChange={setMobileTab}>
            <SelectTrigger className="w-full bg-white border-2 border-purple-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dogs">Dogs</SelectItem>
              <SelectItem value="financial">Financial Overview</SelectItem>
              <SelectItem value="updates">Latest Updates</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-4">
            {mobileTab === "dogs" && (
              <div className="grid gap-4">
                {shelter.currentCauses.map((cause: any) => (
                  <div
                    key={cause.dogId}
                    onClick={() => router.push(`/donate/${cause.dogId}`)}
                    className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm cursor-pointer"
                  >
                    <img
                      src={cause.dogImage || "/placeholder.svg"}
                      alt={cause.dogName}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-sans text-lg font-bold text-gray-900 mb-2">
                      {cause.dogName}
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Help {cause.dogName} find their forever home
                    </p>
                    <button className="w-full rounded-lg bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-purple-900 px-4 py-2 text-sm font-semibold pointer-events-none">
                      Donate Now
                    </button>
                  </div>
                ))}
              </div>
            )}

            {mobileTab === "financial" && (
              <div className="rounded-2xl bg-white p-4 shadow-xl">
                <div className="mb-6 grid gap-4">
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Received</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${shelter.totalReceived.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-orange-600">
                          ${shelter.totalSpent.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="mb-4 font-sans text-lg font-semibold text-gray-800">
                  Recent Transactions
                </h3>
                <div className="space-y-2">
                  {paginatedTransactions.map((tx: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-600">{tx.date}</span>
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                            tx.type === "donation"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {tx.type === "donation" ? "Donation" : "Expense"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">
                        {tx.type === "donation" ? (
                          <>
                            <div>{tx.crypto}</div>
                            <div className="text-xs text-gray-500">From: {tx.donor}</div>
                          </>
                        ) : (
                          tx.description
                        )}
                      </div>
                      <div
                        className={`text-right font-semibold ${tx.type === "donation" ? "text-green-600" : "text-orange-600"}`}
                      >
                        {tx.type === "donation" ? "+" : "-"}${tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mobileTab === "updates" && (
              <div className="space-y-4">
                {shelter.latestUpdates.map((update: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm"
                  >
                    <img
                      src={update.dogImage || "/placeholder.svg"}
                      alt={update.dogName}
                      className="w-full h-40 rounded-lg object-cover mb-3"
                    />
                    <h4 className="font-sans font-bold text-gray-900 text-lg mb-1">
                      {update.dogName}
                    </h4>
                    <span className="text-xs text-gray-600 mb-2 block">{update.date}</span>
                    <p className="text-sm leading-relaxed text-gray-700">{update.update}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
