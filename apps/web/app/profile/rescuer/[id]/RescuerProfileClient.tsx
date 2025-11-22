"use client";

import { useState } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RescuerHeader } from "./components/RescuerHeader";
import { RescuerProfileCarousel } from "./components/RescuerProfileCarousel";
import { DogCard } from "./components/DogCard";
import { TransactionTable } from "./components/TransactionTable";
import { TransactionCard } from "./components/TransactionCard";
import { UpdateCard } from "./components/UpdateCard";
import { FinancialSummary } from "./components/FinancialSummary";
import { PaginationControls } from "./components/PaginationControls";
import type { Rescuer } from "./types";

interface RescuerProfileClientProps {
  rescuer: Rescuer;
}

const TRANSACTIONS_PER_PAGE = 5;

export default function RescuerProfileClient({ rescuer }: RescuerProfileClientProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [mobileTab, setMobileTab] = useState("dogs");

  const paginatedTransactions = rescuer.transactions.slice(
    currentPage * TRANSACTIONS_PER_PAGE,
    (currentPage + 1) * TRANSACTIONS_PER_PAGE
  );
  const totalPages = Math.ceil(rescuer.transactions.length / TRANSACTIONS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <RescuerHeader rescuer={rescuer} />

        <div className="mb-8 mx-auto max-w-4xl">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={rescuer.profilePhoto || "/placeholder.svg"}
                alt={rescuer.fullName}
                fill
                className="object-cover"
              />
            </div>
            <RescuerProfileCarousel rescuer={rescuer} />
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

            <TabsContent value="dogs">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rescuer.currentCauses.map((cause) => (
                  <DogCard key={cause.dogId} cause={cause} variant="desktop" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="financial">
              <div className="rounded-2xl bg-white p-6 shadow-xl">
                <FinancialSummary
                  totalReceived={rescuer.totalReceived}
                  totalSpent={rescuer.totalSpent}
                />
                <h3 className="mb-4 font-sans text-lg font-semibold text-gray-800">
                  Recent Transactions
                </h3>
                <TransactionTable transactions={paginatedTransactions} />
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrevious={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  onNext={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                />
              </div>
            </TabsContent>

            <TabsContent value="updates">
              {rescuer.latestUpdates.length > 0 ? (
                <div className="space-y-4">
                  {rescuer.latestUpdates.map((update, idx) => (
                    <UpdateCard
                      key={`${update.dogName}-${update.date}-${idx}`}
                      update={update}
                      variant="desktop"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No updates yet</div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile View */}
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
                {rescuer.currentCauses.map((cause) => (
                  <DogCard key={cause.dogId} cause={cause} variant="mobile" />
                ))}
              </div>
            )}

            {mobileTab === "financial" && (
              <div className="rounded-2xl bg-white p-4 shadow-xl">
                <FinancialSummary
                  totalReceived={rescuer.totalReceived}
                  totalSpent={rescuer.totalSpent}
                />
                <h3 className="mb-4 font-sans text-lg font-semibold text-gray-800">
                  Recent Transactions
                </h3>
                <div className="space-y-2">
                  {paginatedTransactions.map((tx, idx) => (
                    <TransactionCard
                      key={`${tx.date}-${tx.type}-${tx.amount}-${idx}`}
                      transaction={tx}
                    />
                  ))}
                </div>
              </div>
            )}

            {mobileTab === "updates" && (
              <div className="space-y-4">
                {rescuer.latestUpdates.length > 0 ? (
                  rescuer.latestUpdates.map((update, idx) => (
                    <UpdateCard
                      key={`${update.dogName}-${update.date}-${idx}`}
                      update={update}
                      variant="mobile"
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No updates yet</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
