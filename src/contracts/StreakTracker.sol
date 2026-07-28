// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StreakTracker — loss aversion, compiled (Session 3)
/// @notice Daily check-in with a one-day grace window. Tracks current and
///         longest streak; the longest is a permanent record that survives resets.
///
/// GAMIFICATION CONCEPT: STREAKS leverage LOSS AVERSION (the psychological tendency to prefer
/// avoiding losses over gaining equivalent benefits). When a user has a 10-day streak, they're
/// more motivated to maintain it than they would be to just earn points. The LONGEST STREAK
/// creates a PERMANENT RECORD that survives resets, turning personal bests into trophies.
contract StreakTracker {
    // CONSTANT: Define 1 day in seconds for clarity (86400 seconds)
    // Using named constants makes code more readable than raw numbers
    // This is the minimum time interval between check-ins (prevents same-day spam)
    uint256 public constant DAY = 1 days;   // check-in window
    
    // CONSTANT: Grace period allowing one missed day without breaking the streak
    // This implements FORGIVENESS in gamification - users get one "free pass"
    // This keeps the system friendly and not punishing to real life interruptions
    uint256 public constant GRACE = 1 days; // one missed day forgiven

    // STRUCT: Define the data structure that tracks a user's streak progress
    // Each user gets one of these records to track their habit engagement
    struct Streak {
        // TIMESTAMP of the last check-in (when they last completed their daily action)
        // Used to calculate how much time has elapsed since their last activity
        uint64 lastCheckIn; // when they last showed up
        
        // CURRENT STREAK: How many consecutive days they've maintained the habit
        // This is the "hot" streak they're actively protecting through daily check-ins
        // When they miss a day (beyond the grace period), this resets to 1
        uint32 current;     // the streak they protect
        
        // LONGEST STREAK: The personal best - the highest streak they've ever achieved
        // This never goes down - it's a PERMANENT RECORD of their best performance
        // This creates a psychological hook - users want to "beat their personal record"
        uint32 longest;     // permanent best — survives resets
    }

    // STORAGE: Map each user's address to their streak record
    // This allows each user to maintain their own independent streak
    mapping(address => Streak) public streaks;

    // EVENT: Emit when a user checks in
    // This records every habit completion on the blockchain for analytics
    event CheckedIn(address indexed user, uint32 current, uint32 longest);

    /// @notice Self-service daily check-in. Habits are self-service.
    /// TEACHING POINT: This is the CORE HABIT-BUILDING MECHANIC.
    /// Users call this function once per day to record their daily engagement.
    /// The contract automatically manages streaks and maintains the personal record.
    function checkIn() external {
        // Load the user's streak record from storage
        // 'storage' keyword allows us to modify it directly in storage (not a copy)
        Streak storage s = streaks[msg.sender];
        
        // Calculate how many seconds have passed since their last check-in
        // block.timestamp is the current time on the blockchain
        // Subtracting lastCheckIn shows elapsed time in seconds
        uint256 elapsed = block.timestamp - s.lastCheckIn;

        // GATE 1: Prevent check-in spam - only allow one check-in per day minimum
        // This prevents users from checking in multiple times to artificially boost streaks
        // They must wait at least DAY (86400 seconds) since their last check-in
        require(elapsed >= DAY, "Already checked in today");

        // CORE LOGIC: Update streak based on how much time has passed
        if (s.lastCheckIn != 0 && elapsed <= DAY + GRACE) {
            // CASE 1: They checked in within the grace window (1-2 days of last check-in)
            // This means they missed at most one day, so the streak continues!
            // Even though they missed a day, the grace period saves them
            // This is the FORGIVENESS that keeps users engaged despite real-life interruptions
            s.current += 1; // streak continues (grace held)
        } else {
            // CASE 2: This is either their first check-in OR they broke the streak
            // If lastCheckIn is 0, they're new (first ever check-in)
            // If elapsed > DAY + GRACE, they missed more than 1 day, so streak resets
            // Either way, they're back to day one, building a fresh streak
            s.current = 1; // day one (first ever, or streak reset)
        }

        // UPDATE PERSONAL RECORD: If current streak exceeds the longest ever, update longest
        // This creates the TROPHY/ACHIEVEMENT feeling - their personal best matters forever
        // Even if their current streak resets, the longest survives as a badge of honor
        if (s.current > s.longest) {
            s.longest = s.current; // the record is forever
        }

        // UPDATE TIMESTAMP: Record when this check-in happened
        // This becomes the reference point for the next check-in calculation
        // We store it as uint64 to save storage space (smaller than uint256)
        s.lastCheckIn = uint64(block.timestamp);
        
        // EMIT EVENT: Broadcast the check-in to the blockchain
        // This creates a permanent record of their achievement for the day
        emit CheckedIn(msg.sender, s.current, s.longest);
    }

    /// @notice Retrieve a user's streak information
    /// TEACHING POINT: Public query function for checking habit status
    /// This allows dashboards, UIs, and other contracts to read streak data
    function streakOf(address user)
        external
        view
        returns (uint32 current, uint32 longest, uint64 lastCheckIn)
    {
        // Load the user's streak record from storage into memory (read-only)
        Streak memory s = streaks[user];
        
        // Return all three key metrics: current streak, personal best, and last check-in time
        // This gives the caller complete information about the user's habit history
        return (s.current, s.longest, s.lastCheckIn);
    }
}
