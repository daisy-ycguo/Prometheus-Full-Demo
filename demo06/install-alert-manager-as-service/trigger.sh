while :; do
  # Run `stress` for 1 second
  stress --cpu $(nproc) --timeout 15 &
  wait

  # Sleep for 1 second (idle state)
  sleep 1
done

